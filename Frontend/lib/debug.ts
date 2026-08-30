// Debug utility for API calls
export const debugLog = (message: string, data?: any) => {
  console.log(`[INVENTORY-API] ${message}`, data || '');
};

export const debugError = (message: string, error?: any) => {
  console.error(`[INVENTORY-API-ERROR] ${message}`, error || '');
};

// Test API connection
export const testApiConnection = async (baseUrl: string): Promise<boolean> => {
  try {
    debugLog(`Testing connection to ${baseUrl}`);
    const response = await fetch(`${baseUrl}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const isOk = response.ok;
    debugLog(`API connection test: ${isOk ? 'SUCCESS' : 'FAILED'}`, { status: response.status });
    return isOk;
  } catch (error) {
    debugError('API connection test failed', error);
    return false;
  }
};
