export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  schedule: string;
  page:string;
  whatsapp: string;
  email: string;
  status: 'pending' | 'approved' | 'paused' | 'rejected';
  isPremium: boolean;
  premiumStartDate: Date | null;
  premiumEndDate: Date | null;
  image_url: string;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessImage {
  id: string;
  business_id: string;
  url: string;
  storage_path: string;
  is_main: boolean;
  created_at: string;
}
export interface BusinessPdf {
  id: string;
  business_id: string;
  url: string;
  storage_path: string;
  created_at: string;
}

export type BusinessFormData = Omit<Business, 'id' | 'status' | 'isPremium' | 'created_at' | 'updated_at' | 'image_url'>;

export interface BusinessExtended extends Business {
  images: BusinessImage[];
  pdf?: BusinessPdf | null;

}