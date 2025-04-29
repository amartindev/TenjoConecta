import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  PauseCircle,
  Trash2,
  Edit,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { SEO } from "../components/SEO";
import {
  supabase,
  deleteBusinessImage,
  updateBusinessStatus,
  deleteBusiness,
  updateBusinessMainImage,
  deleteBusinessPdf,
  uploadBusinessPdf,
} from "../lib/supabase";
import type { BusinessExtended, BusinessImage, BusinessPdf } from "../types/business";
import { CATEGORIES } from "../utils/categories";
import { PdfModal } from "../components/admin/PdfModal";
import { ImageModal } from "../components/admin/ImageModal";
import { EditModal } from "../components/admin/EditModal";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessExtended | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    address: "",
    schedule: "",
    whatsapp: "",
    email: "",
    page: "",
    recommended: false,
  });

  const categories = CATEGORIES;

  useEffect(() => {
    checkUser();
    fetchBusinesses();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || user.email !== "amartindev02@gmail.com") {
        navigate("/admin");
        return;
      }
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/admin");
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/admin");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    }
  }

  async function fetchBusinesses() {
    try {
      const { data: businessesData, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (businessesError) throw businessesError;

      const businessesExtended: BusinessExtended[] = [];

      for (const business of businessesData || []) {
        // Obtener imágenes
        const { data: images, error: imagesError } = await supabase
          .from("business_images")
          .select("*")
          .eq("business_id", business.id);

        if (imagesError) throw imagesError;

        // Obtener un solo PDF (asumimos que solo hay uno por negocio)
        const { data: pdfs, error: pdfsError } = await supabase
          .from("business_pdf")
          .select("*")
          .eq("business_id", business.id)
          .limit(1);

        if (pdfsError) throw pdfsError;

        businessesExtended.push({
          ...business,
          images: images || [],
          pdf: pdfs?.[0] || null, // Asignamos el primer PDF o null si no hay
        });
      }

      setBusinesses(businessesExtended);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Error al cargar los negocios");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(business: BusinessExtended) {
    setSelectedBusiness(business);
    setEditForm({
      name: business.name,
      description: business.description,
      category: business.category,
      address: business.address,
      schedule: business.schedule,
      whatsapp: business.whatsapp,
      email: business.email,
      page: business.page,
      recommended: business.recommended,
    });
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    if (!selectedBusiness) return;

    try {
      const { error } = await supabase
        .from("businesses")
        .update(editForm)
        .eq("id", selectedBusiness.id);

      if (error) throw error;

      setBusinesses((prev) =>
        prev.map((b) => (b.id === selectedBusiness.id ? { ...b, ...editForm } : b))
      );

      setShowEditModal(false);
      toast.success("Negocio actualizado correctamente");
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Error al actualizar el negocio");
    }
  }

  async function handleStatusChange(
    business: BusinessExtended,
    status: "approved" | "rejected" | "paused"
  ) {
    try {
      const success = await updateBusinessStatus(business.id, status);
      if (!success) throw new Error("Failed to update status");

      setBusinesses((prev) => prev.map((b) => (b.id === business.id ? { ...b, status } : b)));

      toast.success(
        `Negocio ${
          status === "approved" ? "aprobado" : status === "rejected" ? "rechazado" : "pausado"
        } correctamente`
      );
    } catch (error) {
      console.error("Error updating business:", error);
      toast.error("Error al actualizar el estado");
    }
  }

  async function handleDeleteBusiness(business: BusinessExtended) {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este negocio? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const success = await deleteBusiness(business.id);
      if (!success) throw new Error("Failed to delete business");

      setBusinesses((prev) => prev.filter((b) => b.id !== business.id));
      toast.success("Negocio eliminado correctamente");
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("Error al eliminar el negocio");
    }
  }

  async function handleDeleteImage(business: BusinessExtended, image: BusinessImage) {
    try {
      const success = await deleteBusinessImage(image);
      if (!success) throw new Error("Failed to delete image");

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id
            ? {
                ...b,
                images: b.images.filter((img) => img.id !== image.id),
              }
            : b
        )
      );

      toast.success("Imagen eliminada correctamente");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
    }
  }

  async function handleSetMainImage(business: BusinessExtended, image: BusinessImage) {
    try {
      const success = await updateBusinessMainImage(business.id, image.id);
      if (!success) throw new Error("Failed to update main image");

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id
            ? {
                ...b,
                images: b.images.map((img) => ({
                  ...img,
                  is_main: img.id === image.id,
                })),
              }
            : b
        )
      );

      toast.success("Imagen principal actualizada");
    } catch (error) {
      console.error("Error updating main image:", error);
      toast.error("Error al actualizar la imagen principal");
    }
  }

  async function handleDownloadImage(image: BusinessImage) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = image.storage_path.split("/").pop() || "image";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error al descargar la imagen");
    }
  }

  async function handleDownloadPdf(pdf: BusinessPdf) {
    try {
      const response = await fetch(pdf.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf.storage_path.split("/").pop() || "pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading pdf:", error);
      toast.error("Error al descargar la pdf");
    }
  }

  const handleUploadPdf = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBusiness) return;

    try {
      const newPdf = await uploadBusinessPdf(selectedBusiness.id, file);

      setSelectedBusiness((prevState) => {
        if (!prevState) return null;
        return {
          ...prevState,
          pdf: newPdf,
          images: prevState.images || [],
        };
      });

      setBusinesses((prevState) =>
        prevState.map((b) => (b.id === selectedBusiness.id ? { ...b, pdf: newPdf } : b))
      );

      toast.success("PDF subido correctamente.");
    } catch (error) {
      console.error("Error al subir el PDF:", error);
      toast.error("Hubo un error al subir el PDF.");
    }
  };

  async function handleDeletePdf(business: BusinessExtended, pdf: BusinessPdf) {
    try {
      const success = await deleteBusinessPdf(pdf);
      if (!success) throw new Error("Failed to delete pdf");

      setBusinesses((prev) => prev.map((b) => (b.id === business.id ? { ...b, pdf: null } : b)));

      toast.success("Pdf eliminado correctamente");
    } catch (error) {
      console.error("Error deleting pdf:", error);
      toast.error("Error al eliminar el PDF");
    }
  }



const handleUploadImage = async (business: BusinessExtended): Promise<void> => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const filePath = `${business.id}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("businessimages")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error subiendo imagen:", uploadError.message);
      toast.error("Error subiendo la imagen.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("businessimages")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: newImage, error: insertError } = await supabase
      .from("business_images")
      .insert({
        business_id: business.id,
        url: publicUrl,
        storage_path: filePath,
        is_main: false,
      })
      .select("*")
      .single();
      toast.success("Imagen subida correctamente.");

    if (insertError) {
      console.error("Error guardando imagen en BD:", insertError.message);
      toast.error("Error guardando imagen en la base de datos.");
      return;
    }

    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === business.id
          ? { ...b, images: [...b.images, newImage] }
          : b
      )
    );
  };

  input.click();
};

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
      </div>
    );
  }

  return (
    <>
      <SEO title='Panel de Administración' description='Gestión de negocios en Tenjo Conecta' />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'
          >
            Cerrar sesión
          </button>
        </div>

        <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Negocio
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Categoría
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Estado
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Fecha
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='h-10 w-10 flex-shrink-0'>
                        <img
                          className='h-10 w-10 rounded-full object-cover'
                          src={
                            business.images.find((img) => img.is_main)?.url ||
                            business.images[0]?.url ||
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8"
                          }
                          alt=''
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>{business.name}</div>
                        <div className='text-sm text-gray-500'>{business.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'>
                      {business.category}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : business.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : business.status === "paused"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {business.status === "approved"
                        ? "Aprobado"
                        : business.status === "rejected"
                        ? "Rechazado"
                        : business.status === "paused"
                        ? "Pausado"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(business.created_at).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex justify-end space-x-2'>
                      <button
                        onClick={() => handleStatusChange(business, "approved")}
                        className='text-green-600 hover:text-green-900'
                        title='Aprobar'
                      >
                        <CheckCircle className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleStatusChange(business, "paused")}
                        className='text-yellow-600 hover:text-yellow-900'
                        title='Pausar'
                      >
                        <PauseCircle className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleStatusChange(business, "rejected")}
                        className='text-red-600 hover:text-red-900'
                        title='Rechazar'
                      >
                        <XCircle className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleEdit(business)}
                        className='text-blue-600 hover:text-blue-900'
                        title='Editar'
                      >
                        <Edit className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowPdfModal(true);
                        }}
                        className='text-blue-600 hover:text-blue-900'
                        title='Ver PDF'
                      >
                        <FileText className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowImageModal(true);
                        }}
                        className='text-blue-600 hover:text-blue-900'
                        title='Ver imágenes'
                      >
                        <ImageIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business)}
                        className='text-red-600 hover:text-red-900'
                        title='Eliminar'
                      >
                        <Trash2 className='h-5 w-5' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedBusiness && (
        <ImageModal
          selectedBusiness={selectedBusiness}
          setShowImageModal={setShowImageModal}
          handleSetMainImage={handleSetMainImage}
          handleDownloadImage={handleDownloadImage}
          handleDeleteImage={handleDeleteImage}
          handleUploadImage={handleUploadImage}
        />
      )}

      {/* PDF Modal */}
      {showPdfModal && selectedBusiness && (
        <PdfModal
          selectedBusiness={selectedBusiness}
          setBusinesses={setBusinesses}
          setShowPdfModal={setShowPdfModal}
          handleUploadPdf={handleUploadPdf}
          handleDownloadPdf={handleDownloadPdf}
          handleDeletePdf={handleDeletePdf}
        />
      )}
      {/* Edit Modal */}
      {showEditModal && selectedBusiness && (
        <EditModal
          selectedBusiness={selectedBusiness}
          editForm={editForm}
          categories={Object.values(categories)}
          setEditForm={setEditForm}
          setShowEditModal={setShowEditModal}
          handleSaveEdit={handleSaveEdit}
        />
      )}
    </>
  );
}
