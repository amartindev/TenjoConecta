import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  PauseCircle, 
  Trash2, 
  Edit, 
  Download,
  Star,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { 
  supabase, 
  deleteBusinessImage, 
  updateBusinessStatus,
  deleteBusiness,
  updateBusinessMainImage
} from '../lib/supabase';
import type { BusinessWithImages, BusinessImage } from '../types/business';
import { CATEGORIES } from '../utils/categories';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<BusinessWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithImages | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    schedule: '',
    whatsapp: '',
    email: '',
    page: '',
    recommended: false,
  });

  const categories = CATEGORIES;

  useEffect(() => {
    checkUser();
    fetchBusinesses();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'amartindev02@gmail.com') {
        navigate('/admin');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/admin');
    }
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  }

  async function fetchBusinesses() {
    try {
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessesError) throw businessesError;

      const businessesWithImages: BusinessWithImages[] = [];

      for (const business of businessesData || []) {
        const { data: images, error: imagesError } = await supabase
          .from('business_images')
          .select('*')
          .eq('business_id', business.id);

        if (imagesError) throw imagesError;

        businessesWithImages.push({
          ...business,
          images: images || []
        });
      }

      setBusinesses(businessesWithImages);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Error al cargar los negocios');
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(business: BusinessWithImages) {
    setSelectedBusiness(business);
    setEditForm({
      name: business.name,
      description: business.description,
      category: business.category,
      address: business.address,
      schedule: business.schedule,
      whatsapp: business.whatsapp,
      email: business.email,
      recommended: business.recommended,
    });
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    if (!selectedBusiness) return;

    try {
      const { error } = await supabase
        .from('businesses')
        .update(editForm)
        .eq('id', selectedBusiness.id);

      if (error) throw error;

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === selectedBusiness.id ? { ...b, ...editForm } : b
        )
      );

      setShowEditModal(false);
      toast.success('Negocio actualizado correctamente');
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Error al actualizar el negocio');
    }
  }

  async function handleStatusChange(business: BusinessWithImages, status: 'approved' | 'rejected' | 'paused') {
    try {
      const success = await updateBusinessStatus(business.id, status);
      if (!success) throw new Error('Failed to update status');

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id ? { ...b, status } : b
        )
      );

      toast.success(`Negocio ${
        status === 'approved' ? 'aprobado' : 
        status === 'rejected' ? 'rechazado' : 
        'pausado'
      } correctamente`);
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Error al actualizar el estado');
    }
  }

  async function handleDeleteBusiness(business: BusinessWithImages) {
    if (!confirm('¿Estás seguro de que deseas eliminar este negocio? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const success = await deleteBusiness(business.id);
      if (!success) throw new Error('Failed to delete business');

      setBusinesses((prev) => prev.filter((b) => b.id !== business.id));
      toast.success('Negocio eliminado correctamente');
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Error al eliminar el negocio');
    }
  }

  async function handleDeleteImage(business: BusinessWithImages, image: BusinessImage) {
    try {
      const success = await deleteBusinessImage(image);
      if (!success) throw new Error('Failed to delete image');

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id 
            ? { ...b, images: b.images.filter((img) => img.id !== image.id) }
            : b
        )
      );

      toast.success('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  }

  async function handleSetMainImage(business: BusinessWithImages, image: BusinessImage) {
    try {
      const success = await updateBusinessMainImage(business.id, image.id);
      if (!success) throw new Error('Failed to update main image');

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === business.id
            ? {
                ...b,
                images: b.images.map((img) => ({
                  ...img,
                  is_main: img.id === image.id
                }))
              }
            : b
        )
      );

      toast.success('Imagen principal actualizada');
    } catch (error) {
      console.error('Error updating main image:', error);
      toast.error('Error al actualizar la imagen principal');
    }
  }

  async function handleDownloadImage(image: BusinessImage) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.storage_path.split('/').pop() || 'image';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error al descargar la imagen');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Panel de Administración"
        description="Gestión de negocios en Tenjo Conecta"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negocio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={business.images.find(img => img.is_main)?.url || business.images[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {business.name}
                        </div>
                        <div className="text-sm text-gray-500">{business.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {business.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        business.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : business.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : business.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {business.status === 'approved'
                        ? 'Aprobado'
                        : business.status === 'rejected'
                        ? 'Rechazado'
                        : business.status === 'paused'
                        ? 'Pausado'
                        : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(business.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleStatusChange(business, 'approved')}
                        className="text-green-600 hover:text-green-900"
                        title="Aprobar"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(business, 'paused')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Pausar"
                      >
                        <PauseCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(business, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        title="Rechazar"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(business)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowImageModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver imágenes"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Imágenes de {selectedBusiness.name}</h2>
              <button
                onClick={() => setShowImageModal(false)}
                aria-label='cerrar'
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedBusiness.images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSetMainImage(selectedBusiness, image)}
                        className="p-2 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"
                        title="Establecer como principal"
                      >
                        <Star className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleDownloadImage(image)}
                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-5 w-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(selectedBusiness, image)}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </div>
                  {image.is_main && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                        Principal
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Editar {selectedBusiness.name}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                aria-label='cerrar'
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder='Nombre'
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={editForm.category}
                  aria-label='Categoría'
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={editForm.description}
                  placeholder='Descripción'
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder='Dirección'
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Horario
                </label>
                <input
                  type="text"
                  placeholder='Horario'
                  value={editForm.schedule}
                  onChange={(e) => setEditForm({ ...editForm, schedule: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <input
                  type="text"
                  placeholder='WhatsApp'
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder='Email'
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                Página Web
                </label>
                <input
                  type="text"
                  placeholder='Página Web'
                  value={editForm.page}
                  onChange={(e) => setEditForm({ ...editForm, page: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recomendado
                </label>
                <input
                  type="checkbox"
                  aria-label='recommended'
                  checked={editForm.recommended}
                  onChange={(e) =>
                    setEditForm({ ...editForm, recommended: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2 focus:ring-opacity-50"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}