import type { IndoorFeature } from "../types";

const STORAGE_KEY = "indoor_map_features";

export interface FeatureStorage {
  features: IndoorFeature[];
  lastModified: string;
  version: string;
}

export const featureStorage = {
  saveFeatures: (features: IndoorFeature[]): void => {
    const storage: FeatureStorage = {
      features,
      lastModified: new Date().toISOString(),
      version: "1.0",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  },

  loadFeatures: (): IndoorFeature[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
      const storage: FeatureStorage = JSON.parse(stored);
      return storage.features;
    } catch (error) {
      console.error("Error loading features:", error);
      return [];
    }
  },

  clearFeatures: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
};
