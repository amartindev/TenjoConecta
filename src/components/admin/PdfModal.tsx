import { XCircle, Download, Trash2 } from "lucide-react";
import { BusinessExtended, BusinessPdf } from "../../types/business";

type PdfModalProps = {
  selectedBusiness: BusinessExtended;
  setBusinesses: React.Dispatch<React.SetStateAction<BusinessExtended[]>>;
  setShowPdfModal: (show: boolean) => void;
  handleUploadPdf: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDownloadPdf: (pdf: BusinessPdf) => Promise<void>;
  handleDeletePdf: (business: BusinessExtended, pdf: BusinessPdf) => Promise<void>;
};

export function PdfModal({
  selectedBusiness,
  setShowPdfModal,
  handleUploadPdf,
  handleDownloadPdf,
  handleDeletePdf,
}: PdfModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">PDF de {selectedBusiness.name}</h2>
          <button
            onClick={() => setShowPdfModal(false)}
            aria-label="cerrar"
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {!selectedBusiness.pdf ? (
          <div className="text-center">
            <p>No hay PDF disponible. Puedes subir uno nuevo.</p>
            <input
              type="file"
              aria-label="upload file"
              accept="application/pdf"
              onChange={handleUploadPdf}
              className="mt-2 p-2 border rounded-md"
            />
          </div>
        ) : (
          <div className="relative p-4 border rounded-lg bg-gray-50">
            <div className="mb-2">
              <span className="text-sm break-all">
                {selectedBusiness.pdf.url.split("/").pop()}
              </span>
            </div>

            <div className="flex justify-center mb-4">
              <iframe
                src={selectedBusiness.pdf.url}
                title="PDF preview"
                className="w-full h-48 border"
              ></iframe>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDownloadPdf(selectedBusiness.pdf!)}
                className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                title="Descargar"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={() => handleDeletePdf(selectedBusiness, selectedBusiness.pdf!)}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
