import { createClient } from '@supabase/supabase-js';
import type { Business, BusinessImage } from '../types/business';

// Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Subir imagen
export async function uploadBusinessImage(file: File, businessId: string): Promise<BusinessImage | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${businessId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('businessimages') // <- nombre del bucket
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('businessimages')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { data: imageData, error: insertError } = await supabase
      .from('business_images')
      .insert({
        business_id: businessId,
        url: publicUrl,
        storage_path: filePath,
        is_main: false
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return imageData;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

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

// Eliminar un negocio (y sus imágenes del storage)
export async function deleteBusiness(businessId: string): Promise<boolean> {
  try {
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
