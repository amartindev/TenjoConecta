import { createClient } from '@supabase/supabase-js';
import type { Business, BusinessImage, BusinessPdf } from '../types/business';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Eliminar imagen individual
export async function deleteBusinessImage(image: BusinessImage): Promise<boolean> {
  try {
    const { error: storageError } = await supabase.storage
      .from('businessimages')
      .remove([image.storage_path]);

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('business_images')
      .delete()
      .eq('id', image.id);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Eliminar PDF
export async function deleteBusinessPdf(pdf: BusinessPdf): Promise<boolean> {
  try {

    // Intentamos eliminar el archivo PDF que se pasa como parámetro
    const { error: storageError } = await supabase.storage
      .from('businesspdf')
      .remove([pdf.storage_path]);

    if (storageError) {
      console.error('Error al eliminar el archivo PDF del almacenamiento:', storageError);
      return false;
    }

    // Eliminar el registro del PDF en la base de datos
    const { error: dbError } = await supabase
      .from('business_pdf')
      .delete()
      .eq('id', pdf.id);

    if (dbError) {
      console.error('Error al eliminar el PDF de la base de datos:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar PDF:', error);
    return false;
  }
}



// Actualizar estado del negocio
export async function updateBusinessStatus(
  businessId: string, 
  status: Business['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({ status })
      .eq('id', businessId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating business status:', error);
    return false;
  }
}

// Eliminar un negocio (sus imágenes y pdf del storage)
export async function deleteBusiness(businessId: string): Promise<boolean> {
  try {
    // Eliminar las imágenes asociadas al negocio
    const { data: images } = await supabase
      .from('business_images')
      .select('*')
      .eq('business_id', businessId);

    if (images && images.length > 0) {
      const storagePaths = images.map(img => img.storage_path);
      await supabase.storage
        .from('businessimages')
        .remove(storagePaths);
    }

    // Eliminar los archivos PDF asociados al negocio
    const { data: pdfData } = await supabase
      .from('business_pdf')
      .select('*')
      .eq('business_id', businessId);

    if (pdfData && pdfData.length > 0) {
      // Eliminar los archivos PDF del almacenamiento
      const storagePathsPdf = pdfData.map(pdf => pdf.storage_path);
      await supabase.storage
        .from('businesspdf')
        .remove(storagePathsPdf);

      // Eliminar las entradas correspondientes a los PDFs en la base de datos
      const { error: deletePdfError } = await supabase
        .from('business_pdf')
        .delete()
        .eq('business_id', businessId);

      if (deletePdfError) throw deletePdfError;
    }

    // Eliminar el negocio de la base de datos
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting business:', error);
    return false;
  }
}

// Subir PDF

export async function uploadBusinessPdf(businessId: string, file: File) {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${businessId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("businesspdf")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from("businesspdf").getPublicUrl(filePath);

  const { data, error: upsertError } = await supabase
    .from("business_pdf")
    .upsert({
      business_id: businessId,
      url: publicUrl,
      storage_path: filePath,
    })
    .select()
    .single();

  if (upsertError) throw upsertError;
  if (!data) throw new Error("No se pudo obtener el PDF insertado");

  return data; // retorna el pdf insertado
}

// Marcar imagen principal
export async function updateBusinessMainImage(
  businessId: string,
  imageId: string
): Promise<boolean> {
  try {
    await supabase
      .from('business_images')
      .update({ is_main: false })
      .eq('business_id', businessId);

    const { error } = await supabase
      .from('business_images')
      .update({ is_main: true })
      .eq('id', imageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating main image:', error);
    return false;
  }
}
