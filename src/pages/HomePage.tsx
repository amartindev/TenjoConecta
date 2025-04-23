import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BusinessCard } from '../components/BusinessCard';
import { supabase } from '../lib/supabase';
import type { Business } from '../types/business';
import { CATEGORIES, KEYWORDS } from '../utils/categories';


export function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [businessImages, setBusinessImages] = useState<any[]>([]);
  const [mergedBusinesses, setMergedBusinesses] = useState<Business[]>([]);
  const [mergedFeaturedBusinesses, setMergedFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';


  const categories = CATEGORIES;
  const keywords = KEYWORDS;

  // Funciones para el carrusel
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => 
      prev === mergedFeaturedBusinesses.length - 1 ? 0 : prev + 1
    );
  }, [mergedFeaturedBusinesses.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? mergedFeaturedBusinesses.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (!searchQuery && mergedFeaturedBusinesses.length > 0) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, searchQuery, mergedFeaturedBusinesses.length]);

  // Fetch de los negocios destacados (featured)
  useEffect(() => {
    async function fetchFeaturedBusinesses() {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('status', 'approved')
          .eq('recommended', true)
          .limit(10);

        if (error) throw error;
        setFeaturedBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching featured businesses:', error);
      }
    }
    fetchFeaturedBusinesses();
  }, []);

  // Fetch de los negocios generales
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        let query = supabase
          .from('businesses')
          .select('*')
          .eq('status', 'approved');

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery) {
          const searchTerms = searchQuery.toLowerCase().split(' ');
          const conditions = [];

          for (const term of searchTerms) {
            const relatedCategories = keywords[term as keyof typeof keywords];
            
            if (relatedCategories) {
              const cats = Array.isArray(relatedCategories) ? relatedCategories : [relatedCategories];
              conditions.push(...cats.map(cat => `category.eq.${cat}`));
            } else {
              conditions.push(`name.ilike.%${term}%`);
              conditions.push(`description.ilike.%${term}%`);
            }
          }

          if (conditions.length > 0) {
            query = query.or(conditions.join(','));
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        setBusinesses(data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [selectedCategory, searchQuery]);

  // Fetch de las imágenes (business_images)
  useEffect(() => {
    async function fetchBusinessImages() {
      try {
        const { data, error } = await supabase
          .from('business_images')
          .select('*');
        if (error) throw error;
        setBusinessImages(data || []);
      } catch (error) {
        console.error('Error fetching business images:', error);
      }
    }
    fetchBusinessImages();
  }, []);

  // Fusionar negocios generales con sus imágenes correspondientes
  useEffect(() => {
    const merged = businesses.map((business) => {
      const image = businessImages.find(
        (img) => img.business_id === business.id && img.is_main
      );
      return { ...business, image_url: image?.url };
    });
    setMergedBusinesses(merged);
  }, [businesses, businessImages]);

  // Fusionar negocios destacados (featured) con sus imágenes correspondientes
  useEffect(() => {
    const merged = featuredBusinesses.map((business) => {
      const image = businessImages.find(
        (img) => img.business_id === business.id && img.is_main
      );
      return { ...business, image_url: image?.url };
    });
    setMergedFeaturedBusinesses(merged);
  }, [featuredBusinesses, businessImages]);

  return (
    <>
      <SEO
        title="Inicio"
        description="Encuentra y conecta con los mejores negocios y servicios en Tenjo, Cundinamarca. ¡Pide domicilios y recibe en la puerta de tu casa!"
        keywords="negocios tenjo, servicios tenjo, restaurantes tenjo, comercio local, domicilios tenjo"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas en Tenjo, a un clic de distancia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra restaurantes, tiendas y servicios locales. Pide domicilios, 
            contacta directamente por WhatsApp y recibe en la puerta de tu casa. 
            ¡Apoyemos el comercio local!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form 
            action="/"
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const search = formData.get('search') as string;
              window.location.href = `/?search=${encodeURIComponent(search)}`;
            }}
          >
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Buscar negocios, productos, servicios..."
              className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              type="submit"
              aria-label='Buscar negocios, productos, servicios...'
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Featured Businesses Carousel */}
        {!searchQuery && !loading && mergedFeaturedBusinesses.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
              <h2 className="text-2xl font-bold text-gray-900">Negocios Recomendados</h2>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {mergedFeaturedBusinesses.map((business) => (
                    <div key={business.id} className="w-full flex-shrink-0">
                      <div className="relative h-96">
                        <img
                          src={business.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                          <h3 className="text-3xl font-bold mb-2">{business.name}</h3>
                          <p className="text-lg mb-4">{business.description}</p>
                          <button
                            onClick={() => {
                              const message = encodeURIComponent(`¡Hola! Los contacto desde Tenjo Conecta. Me gustaría obtener información sobre ${business.name}`);
                              window.open(`https://wa.me/57${business.whatsapp}?text=${message}`, '_blank');
                            }}
                            className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            aria-label='Boton Whatsapp'
                          >
                            Contactar por WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                aria-label='Izquierda'
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                aria-label='Derecha'
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-lg transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {mergedFeaturedBusinesses.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label='index'
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentSlide === index
                        ? 'bg-blue-600 w-6'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            aria-label='Todas las categorias'
            className={`px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              aria-label={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-all transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {mergedBusinesses.length > 0 
                ? `Resultados de búsqueda para "${searchQuery}"`
                : `No se encontraron resultados para "${searchQuery}"`
              }
            </h2>
            {mergedBusinesses.length > 0 && (
              <p className="text-gray-600">
                Se encontraron {mergedBusinesses.length} {mergedBusinesses.length === 1 ? 'negocio' : 'negocios'}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : mergedBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mergedBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No se encontraron negocios</p>
          </div>
        )}
      </div>
    </>
  );
}
