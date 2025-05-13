import { Phone, Mail, MessageSquare } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useEffect } from 'react';

export function ContactPage() {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('¡Hola! Me gustaría obtener más información sobre Tenjo Conecta');
    window.open(`https://wa.me/573222104408?text=${message}`, '_blank');
  };

    useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <>
      <SEO
        title="Contacto"
        description="Contáctanos para más información sobre Tenjo Conecta o para registrar tu negocio."
        keywords="contacto tenjo conecta, whatsapp tenjo, negocios tenjo"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-green-900 mb-2">Contacto</h1>
            <h2 className="text-4xl font-bold pb-4 text-yellow-500">Tenjo Conecta</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900">¿Cómo podemos ayudarte?</h3>
                  <p className="text-gray-600">
                    En Tenjo Conecta estamos comprometidos con conectar a la comunidad con los negocios
                    y servicios locales. Si eres dueño de un negocio y quieres formar parte de nuestro
                    directorio, ¡contáctanos!
                  </p>
                  <p className="text-gray-600">
                    También agradecemos tus comentarios y sugerencias para seguir mejorando nuestra
                    plataforma.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">WhatsApp</p>
                        <p className="text-lg font-medium text-gray-900">+57 322 210 4408</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Correo electrónico</p>
                        <a 
                          href="mailto:info@tenjoconecta.com" 
                          className="text-lg font-medium text-gray-900 hover:text-blue-600"
                        >
                          info@tenjoconecta.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Contacto rápido</h3>
                    <p className="text-gray-600">
                      Contáctanos por WhatsApp para una respuesta más rápida
                    </p>
                    
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contactar por WhatsApp
                    </button>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Horario de atención</h4>
                      <div className="space-y-2">
                        <p className="text-gray-600">Lunes a Viernes: 8:00 AM - 6:00 PM</p>
                        <p className="text-gray-600">Sábados: 9:00 AM - 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}