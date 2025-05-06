import { XCircle, Save } from "lucide-react";
import { BusinessExtended } from "../../types/business";

type EditModalProps = {
  selectedBusiness: BusinessExtended;
  editForm: {
    name: string;
    description: string;
    category: string;
    address: string;
    schedule: string;
    whatsapp: string;
    email: string;
    page: string;
    isPremium: boolean;
    premiumStartDate: Date | null;
    premiumEndDate: Date | null;
  };
  categories: string[];
  setEditForm: React.Dispatch<React.SetStateAction<EditModalProps["editForm"]>>;
  setShowEditModal: (show: boolean) => void;
  handleSaveEdit: () => Promise<void>;
};

export function EditModal({
  selectedBusiness,
  editForm,
  categories,
  setEditForm,
  setShowEditModal,
  handleSaveEdit,
}: EditModalProps) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-scroll'>
      <div className='bg-white rounded-lg p-6 max-w-2xl w-full'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold'>Editar {selectedBusiness.name}</h2>
          <button
            onClick={() => setShowEditModal(false)}
            aria-label='cerrar'
            className='text-gray-500 hover:text-gray-700'
          >
            <XCircle className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>Nombre</label>
            <input
              type='text'
              placeholder='Nombre'
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Categoría</label>
            <select
              value={editForm.category}
              aria-label='Categoría'
              onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Descripción</label>
            <textarea
              value={editForm.description}
              placeholder='Descripción'
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Dirección</label>
            <input
              type='text'
              placeholder='Dirección'
              value={editForm.address}
              onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Horario</label>
            <input
              type='text'
              placeholder='Horario'
              value={editForm.schedule}
              onChange={(e) => setEditForm((prev) => ({ ...prev, schedule: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>WhatsApp</label>
            <input
              type='text'
              placeholder='WhatsApp'
              value={editForm.whatsapp}
              onChange={(e) => setEditForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Email</label>
            <input
              type='email'
              placeholder='Email'
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Página Web</label>
            <input
              type='text'
              placeholder='Página Web'
              value={editForm.page}
              onChange={(e) => setEditForm((prev) => ({ ...prev, page: e.target.value }))}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>Premium</label>
            <input
              type='checkbox'
              aria-label='isPremium'
              checked={editForm.isPremium}
              onChange={(e) => setEditForm((prev) => ({ ...prev, isPremium: e.target.checked }))}
              className='h-4 w-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2 focus:ring-opacity-50'
            />
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Fecha de inicio Premium
              </label>
              <input
                type='date'
                aria-label='Fecha de inicio'
                value={
                  editForm.premiumStartDate
                    ? editForm.premiumStartDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditForm((prev) => {
                    const newDate = new Date(e.target.value);
                    return {
                      ...prev,
                      premiumStartDate: newDate,
                      premiumEndDate:
                        prev.premiumEndDate && newDate > prev.premiumEndDate
                          ? newDate
                          : prev.premiumEndDate,
                    };
                  })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>

            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Fecha de fin Premium
              </label>
              <input
                type='date'
                aria-label='Fecha de fin'
                value={
                  editForm.premiumEndDate ? editForm.premiumEndDate.toISOString().split("T")[0] : ""
                }
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    premiumEndDate: new Date(e.target.value),
                  }))
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>

        <div className='mt-6 flex justify-end space-x-3'>
          <button
            onClick={() => setShowEditModal(false)}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEdit}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center'
          >
            <Save className='h-4 w-4 mr-2' />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
