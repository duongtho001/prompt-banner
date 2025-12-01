import { GeneratedResult } from "../types";

const STORAGE_KEY = "prompt_master_library";
const API_KEYS_STORAGE_KEY = "prompt_master_api_keys";

// --- LIBRARY FUNCTIONS ---

export const getLibrary = (): GeneratedResult[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load library", error);
    return [];
  }
};

export const saveToLibrary = (result: GeneratedResult) => {
  try {
    const current = getLibrary();
    // Check if exists to update (e.g. adding image url later), else unshift (add to top)
    const index = current.findIndex(item => item.id === result.id);
    
    // Limit library size to 50 items to prevent storage overflow
    if (index !== -1) {
      current[index] = result;
    } else {
      current.unshift(result);
      if (current.length > 50) {
        current.pop();
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (error) {
    console.error("Failed to save to library", error);
  }
};

export const removeFromLibrary = (id: string): GeneratedResult[] => {
  try {
    const current = getLibrary();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to delete from library", error);
    return [];
  }
};

export const clearLibrary = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// --- API KEY FUNCTIONS ---

export const getStoredApiKeys = (): string[] => {
  try {
    const data = localStorage.getItem(API_KEYS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
};

export const saveApiKeys = (keys: string[]) => {
  try {
    // Filter empty lines and trim
    const cleanKeys = keys.map(k => k.trim()).filter(k => k.length > 0);
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(cleanKeys));
  } catch (error) {
    console.error("Failed to save API keys", error);
  }
};