import { XCircle, Star, Download, Trash2 } from "lucide-react";
import { BusinessExtended, BusinessImage } from "../../types/business";

type ImageModalProps = {
  selectedBusiness: BusinessExtended;
  setShowImageModal: (show: boolean) => void;
  handleSetMainImage: (business: BusinessExtended, image: BusinessImage) => Promise<void>;
  handleDownloadImage: (image: BusinessImage) => Promise<void>;
  handleDeleteImage: (business: BusinessExtended, image: BusinessImage) => Promise<void>;
};

export function ImageModal({
  selectedBusiness,
  setShowImageModal,
  handleSetMainImage,
  handleDownloadImage,
  handleDeleteImage,
}: ImageModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Imágenes de {selectedBusiness.name}</h2>
          <button
            onClick={() => setShowImageModal(false)}
            aria-label="cerrar"
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
  );
}
