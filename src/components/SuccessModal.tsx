import { CheckCircle } from "lucide-react";

export function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl">
        <div className="flex flex-col gap-4 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800">¡Registro exitoso!</h2>
          <p className="text-gray-700">
            Gracias por registrarte en <strong>Tenjo Conecta</strong>. Nuestro equipo revisará tu
            información para asegurarse de que todo esté en orden y muy pronto tu negocio estará
            visible en nuestra plataforma.
          </p>

          <div className="text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
              <CheckCircle className="w-5 h-5" />
              Disfruta de 3 meses GRATIS del plan Premium, que incluye:
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Tu negocio en los primeros lugares de búsqueda</li>
              <li>Aparición en el banner principal del sitio</li>
              <li>Visibilidad destacada en el directorio con una estrella especial</li>
              <li>Opción de subir hasta 10 imágenes en tu perfil</li>
              <li>Posibilidad de incluir tu menú o catálogo en PDF</li>
            </ul>
          </div>

          <div className="mt-2 text-gray-700">
            <p className="mb-1">📞 ¿Tienes dudas o necesitas ayuda?</p>
            <p>
              Escríbenos por WhatsApp <span className="italic">+57 322 210 4408 </span>o al correo:{" "}
              <a href="mailto:info@tenjoconecta.com" className="text-blue-600 underline">
                info@tenjoconecta.com
              </a>
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
