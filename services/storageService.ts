import { GeneratedResult } from "../types";

const STORAGE_KEY = "prompt_master_library";

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