import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export interface ProductData {
  product_name?: string;
  barcode?: string;
  [key: string]: any;
}

export interface LabelData {
  mrp?: string | number;
  batch?: string;
  mfg?: string;
  exp?: string;
  quantity?: string | number;
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface ProcessProductResponse {
  review_id: string;
  product: {
    barcode_found: boolean;
    product_found: boolean;
    product?: ProductData;
    barcode?: string;
    method?: string;
  };
  label: LabelData;
  validation: ValidationResult;
}

export interface ConfirmSaveRequest {
  product_name: string;
  barcode: string;
  mrp: string | number;
  batch: string;
  mfg: string;
  exp: string;
  quantity: string | number;
}

export interface ConfirmSaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SheetRow {
  product_name: string;
  barcode: string;
  mrp: number;
  batch: string;
  mfg: string;
  exp: string;
  quantity: number;
  date_added: string;
}

// Process product (upload 2 images)
export const processProduct = async (
  productImage: File,
  labelImage: File
): Promise<ProcessProductResponse> => {
  const formData = new FormData();
  formData.append('product_image', productImage, productImage.name);
  formData.append('label_image', labelImage, labelImage.name);

  try {
    const response = await api.post<ProcessProductResponse>(
      '/process-product',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180000, // Increased to 3 minutes for image processing
        onUploadProgress: (progressEvent) => {
          // Track upload progress
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Log upload progress for debugging
            if (percentCompleted % 25 === 0) {
              console.log(`📊 Upload progress: ${percentCompleted}%`);
            }
          }
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Process product error:', error);

    // Provide better error messages for timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw {
        error: 'Timeout: The backend is taking too long to process the images. Please try smaller images or check backend status.',
      };
    }

    if (error.code === 'ERR_NETWORK' || error.name === 'NetworkError') {
      throw {
        error: 'Network error: The backend server is not reachable. Please check if the backend is running and accessible.',
      };
    }

    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

// Confirm and save to Google Sheets
export const confirmAndSave = async (
  data: ConfirmSaveRequest
): Promise<ConfirmSaveResponse> => {
  const response = await api.post<ConfirmSaveResponse>(
    '/confirm-and-save',
    data
  );

  return response.data;
};

// Get sheets data
export const getSheetsData = async (): Promise<SheetRow[]> => {
  try {
    console.log('🔍 Fetching data from /get-sheets-data endpoint...');

    const response = await api.get<SheetRow[] | any>('/get-sheets-data', {
      timeout: 30000,
    });

    console.log('✅ Response received:', response.status, response.data);

    // Handle if response is an array (correct format)
    if (response.data && Array.isArray(response.data)) {
      console.log(`✅ Got ${response.data.length} products from sheets`);
      return response.data;
    }

    // If response has a data property, use that
    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log(`✅ Got ${response.data.data.length} products from sheets`);
      return response.data.data;
    }

    // If response is empty or invalid format
    console.warn('⚠️ Response is not in expected format:', response.data);
    return [];

  } catch (error: any) {
    console.error('❌ Get sheets data error:', error);

    // Log detailed error information
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Backend might be down.');
      // Don't log the XMLHttpRequest object directly (prints as [object XMLHttpRequest])
    } else {
      console.error('Error message:', error.message);
    }

    // Try to extract data from error response
    if (error.response?.data?.data && Array.isArray(error.response.data.data)) {
      console.log('📦 Using error response data');
      return error.response.data.data;
    }

    // Return empty array to prevent crash
    console.log('📦 Returning empty array as fallback');
    return [];
  }
};
