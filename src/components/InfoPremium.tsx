import { CheckCircle } from "lucide-react";

export default function InfoPremium() {
  const whatsappUrl = `https://wa.me/573222104408?text=Hola,%20tengo%20dudas%20sobre%20mi%20registro%20en%20Tenjo%20Conecta.`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="flex flex-col gap-4">
    <div className="text-3xl text-center">🎉</div>
    <h2 className="text-xl font-bold text-gray-800 text-center">
      ¡Bienvenido a Tenjo Conecta!
    </h2>
    <p className="text-gray-700 text-center">
      El <strong>registro es completamente GRATIS</strong> y si es tu primera vez, disfrutarás de
      <strong> 3 meses de beneficios Premium</strong> sin costo.
    </p>

    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
        <CheckCircle className="w-5 h-5" />
        Beneficios del plan Premium:
      </div>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>Tu negocio en los primeros lugares de búsqueda</li>
        <li>Aparición en el banner principal del sitio</li>
        <li>Visibilidad destacada en el directorio con una estrella especial</li>
        <li>Opción de subir hasta 10 imágenes en tu perfil</li>
        <li>Posibilidad de incluir tu menú o catálogo en PDF</li>
      </ul>
    </div>

    <div className="mt-2 text-sm text-gray-700 text-center">
      ¿Tienes dudas? Escríbenos por WhatsApp{" "}
      <a href={whatsappUrl} className="italic">+57 322 210 4408</a> o al correo:{" "}
      <a href="mailto:info@tenjoconecta.com" className="text-blue-600 underline">
        info@tenjoconecta.com
      </a>
    </div>
  </div>
</div>

  )
}
