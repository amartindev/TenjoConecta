import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";
import { SEO } from "../components/SEO";
import { supabase } from "../lib/supabase";
import type { BusinessFormData } from "../types/business";
import { CATEGORIES } from "../utils/categories";
import { SuccessModal } from "../components/SuccessModal";


export function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState<BusinessFormData>({
        name: "",
        description: "",
        category: "",
        address: "",
        schedule: "",
        whatsapp: "",
        email: "",
        page: "",
    });

    // const categories = CATEGORIES;
    const categories: string[] = Array.isArray(CATEGORIES)
        ? CATEGORIES
        : Object.values(CATEGORIES);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.whatsapp.length < 10) {
            toast.error("Por favor ingresa un número de teléfono válido (al menos 10 dígitos)");
            return;
        }

        setLoading(true);

        try {
            const { data: business, error: businessError } = await supabase
                .from("businesses")
                .insert([{ ...formData, status: "pending" }])
                .select()
                .single();

            if (businessError) throw businessError;

            if (selectedFiles.length > 0 && business) {
                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Date.now()}_${i}.${fileExt}`;
                    const filePath = `${business.id}/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("businessimages")
                        .upload(filePath, file);

                    if (uploadError) {
                        await supabase
                            .from("businesses")
                            .delete()
                            .eq("id", business.id);
                        throw uploadError;
                    }

                    const {
                        data: { publicUrl },
                    } = supabase.storage
                        .from("businessimages")
                        .getPublicUrl(filePath);

                    const { error: imageError } = await supabase
                        .from("business_images")
                        .insert({
                            business_id: business.id,
                            url: publicUrl,
                            storage_path: filePath,
                            is_main: i === 0, // solo la primera imagen es principal
                        });

                    if (imageError) {
                        await supabase
                            .from("businesses")
                            .delete()
                            .eq("id", business.id);
                        throw imageError;
                    }
                }
            }


            if (selectedPdf && business) {
                const file = selectedPdf;
                const fileName = `${Date.now()}.pdf`;
                const filePath = `${business.id}/${fileName}`;
            
                const { error: uploadError } = await supabase.storage
                    .from("businesspdf")
                    .upload(filePath, file);
            
                if (uploadError) {
                    await supabase
                        .from("businesses")
                        .delete()
                        .eq("id", business.id);
                    throw uploadError;
                }
            
                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("businesspdf")
                    .getPublicUrl(filePath);
            
                const { error: pdfError } = await supabase
                    .from("business_pdf")
                    .insert({
                        business_id: business.id,
                        url: publicUrl,
                        storage_path: filePath
                    });
            
                if (pdfError) {
                    await supabase
                        .from("businesses")
                        .delete()
                        .eq("id", business.id);
                    throw pdfError;
                }
            }
            


            toast.success("Solicitud enviada con éxito");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al enviar la solicitud");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        const { name, value } = e.target;
        let newValue = value;
      
        if (name === 'whatsapp') {
          newValue = newValue.replace(/^(\+57|57)/, '');
          newValue = newValue.replace(/\s+/g, '');
          newValue = newValue.replace(/\D/g, '');
        }
      
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
        }));
      };
      
    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const validTypes = ["image/jpeg", "image/png", "image/gif"];

        const validFiles = files.filter((file) => {
            if (!validTypes.includes(file.type)) {
                toast.error(`Archivo ${file.name} no es una imagen válida`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`Archivo ${file.name} excede los 10MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedFiles((prev) => [...prev, ...validFiles]);
            toast.success(`${validFiles.length} imagen(es) seleccionada(s)`);
        }
    };

    const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
    
        if (!file) return;
    
        if (file.type !== "application/pdf") {
            toast.error(`El archivo ${file.name} no es un PDF válido`);
            return;
        }
    
        if (file.size > 10 * 1024 * 1024) {
            toast.error(`El archivo ${file.name} excede los 10MB`);
            return;
        }
    
        setSelectedPdf(file);
        toast.success(`Archivo ${file.name} cargado exitosamente`);
    };

    const removeImage = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };
    
      useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

    return (
        <>
            <SEO
                title='Registrar Negocio'
                description='Registra tu negocio en Tenjo Conecta y llega a más clientes.'
                keywords='registro negocio, publicar negocio, tenjo, directorio comercial'
            />

            <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='bg-white rounded-2xl shadow-xl p-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-8 text-center'>
                        Registra tu Negocio
                    </h1>

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        {/* Campos de texto */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Nombre del Negocio *
                            </label>
                            <input
                                type='text'
                                name='name'
                                placeholder="Nombre del Negocio"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Categoría *
                            </label>
                            <select
                                name='category'
                                aria-label="Categoria"
                                required
                                value={formData.category}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            >
                                <option value=''>
                                    Selecciona una categoría
                                </option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Descripción *
                            </label>
                            <textarea
                                name='description'
                                placeholder="Descripción"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Dirección *
                            </label>
                            <input
                                type='text'
                                name='address'
                                placeholder="Dirección"
                                
                                value={formData.address}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Horario de Atención *
                            </label>
                            <input
                                type='text'
                                name='schedule'
                                required
                                placeholder='Ej: Lunes a Viernes 9:00 AM - 6:00 PM'
                                value={formData.schedule}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                WhatsApp *
                            </label>
                            <div className='mt-1 flex rounded-lg shadow-sm'>
                                <span className='inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 text-sm'>
                                    +57
                                </span>
                                <input
                                    type='tel'
                                    name='whatsapp'
                                    required
                                    placeholder='3101234567'
                                    value={formData.whatsapp}
                                    onChange={handleChange}
                                    maxLength={10}
                                    className='block w-full rounded-r-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Correo Electrónico
                            </label>
                            <input
                                type='email'
                                name='email'
                                placeholder="Correo Electrónico"
                                
                                value={formData.email}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Página Web
                            </label>
                            <input
                                type='text'
                                name='page'
                                placeholder="Página Web"
                                
                                value={formData.page}
                                onChange={handleChange}
                                className='mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            />
                        </div>

                        {/* Carga de imágenes */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>
                                Imágenes del negocio
                            </label>
                            <input
                                type='file'
                                aria-label="Imágenes del negocio"
                                accept='image/*'
                                multiple
                                onChange={handleImagesChange}
                                className='mt-1'
                            />
                            {selectedFiles.length > 0 && (
                                <div className='mt-4 grid grid-cols-3 gap-4'>
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className='relative group'
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index}`}
                                                className='w-full h-32 object-cover rounded-lg border'
                                            />
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className='absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full hidden group-hover:block'
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Carga del archivo */}
                        <div>
                        <label className='block text-sm font-medium text-gray-700'>
                                Menú o Catálogo del negocio
                            </label>
                            <input
                                type='file'
                                aria-label="Menú o Catálogo del negocio"
                                accept='.pdf'
                                onChange={handlePdfChange}
                                className='mt-1'
                            />
                        </div>

                        <div>
                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full flex justify-center items-center gap-2 bg-green-800 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-lg'
                            >
                                {loading ? "Enviando..." : "Registrar Negocio"}
                                <Upload className='w-4 h-4' />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <SuccessModal isOpen={showSuccessModal} onClose={() => {
  setShowSuccessModal(false);
  navigate("/");
}} />

        </>
    );
}
