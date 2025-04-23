import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import type { Business } from '../types/business';

interface BusinessPhoto {
  id: string;
  url: string;
}

export function BusinessDetailPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinessAndPhotos() {
      try {
        // Fetch business details
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (businessError) throw businessError;
        setBusiness(businessData);

        // Fetch business photos
        const { data: photosData, error: photosError } = await supabase
          .from('business_images')
          .select('id, url')
          .eq('business_id', id);

        if (photosError) throw photosError;
        
        // Add the main image to the photos array if it exists
        const allPhotos: BusinessPhoto[] = [];
        if (businessData.image_url) {
          allPhotos.push({ id: 'main', url: businessData.image_url });
        }
        if (photosData) {
          allPhotos.push(...photosData);
        }
        setPhotos(allPhotos);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBusinessAndPhotos();
    }
  }, [id]);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Negocio no encontrado</h2>
          <p className="text-red-600">El negocio que buscas no existe o no está disponible.</p>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/57${business.whatsapp}`;

  return (
    <>
      <SEO
        title={business.name}
        description={business.description}
        keywords={`${business.name}, ${business.category}, negocios tenjo, servicios tenjo`}
        image={business.image_url}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-green-800 hover:text-green-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Photo Gallery */}
          <div className="relative h-96">
            {photos.length > 0 && (
              <>
                <img
                  src={photos[currentPhotoIndex].url}
                  alt={`${business.name} - Foto ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      aria-label='foto anterior'
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      aria-label='foto siguiente'
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          aria-label='fotos de negocios'
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentPhotoIndex === index
                              ? 'bg-white w-4'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-green-800 text-white text-sm font-medium rounded-full">
                {business.category}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{business.name}</h1>
            
            <p className="text-lg text-gray-600 mb-6">{business.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ubicación</h2>
                <p className="text-gray-600">{business.address}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Horario</h2>
                <p className="text-gray-600">{business.schedule}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Telefono</h2>
                <p className="text-gray-600">{business.whatsapp}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}