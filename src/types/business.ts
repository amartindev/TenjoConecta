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
  recommended: boolean;
  image_url: string;
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

export type BusinessFormData = Omit<Business, 'id' | 'status' | 'recommended' | 'created_at' | 'updated_at' | 'image_url'>;

export interface BusinessWithImages extends Business {
  images: BusinessImage[];
}