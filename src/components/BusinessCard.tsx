import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Business } from '../types/business';

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent card click from triggering
    const message = encodeURIComponent(`¡Hola! Los contacto desde Tenjo Conecta. Me gustaría obtener información sobre ${business.name}`);
    window.open(`https://wa.me/57${business.whatsapp}?text=${message}`, '_blank');
  };

  return (
    <Link 
      to={`/business/${business.id}`}
      className="block bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
    >
      <div className="relative h-48">
        <img
          src={business.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8'}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
            {business.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{business.name}</h3>
        <p className="text-gray-600 line-clamp-2 mb-4">{business.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Ver más
          </span>
          
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <Phone className="h-4 w-4 mr-2" />
            WhatsApp
          </button>
        </div>
      </div>
    </Link>
  );
}