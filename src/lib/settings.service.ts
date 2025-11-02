// Settings Service - Manage restaurant settings (logo, banner, etc.)
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface RestaurantSettings {
  logo?: string;
  banner?: string;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  updatedAt?: Date;
}

const SETTINGS_DOC = 'settings/restaurant';

class SettingsService {
  /**
   * Get restaurant settings
   */
  async getSettings(): Promise<RestaurantSettings> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          logo: data.logo,
          banner: data.banner,
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          description: data.description,
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : data.updatedAt ? new Date(data.updatedAt) : undefined,
        };
      }

      return {};
    } catch (error) {
      console.error('Error getting settings:', error);
      // Return empty object instead of throwing to allow page to load
      return {};
    }
  }

  /**
   * Update restaurant settings
   */
  async updateSettings(settings: Partial<RestaurantSettings>): Promise<void> {
    try {
      const docRef = doc(db, SETTINGS_DOC);
      const docSnap = await getDoc(docRef);

      const data = {
        ...settings,
        updatedAt: Timestamp.now(),
      };

      if (docSnap.exists()) {
        await updateDoc(docRef, data);
      } else {
        await setDoc(docRef, data);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Không thể cập nhật cài đặt. Vui lòng thử lại.');
    }
  }

  /**
   * Update logo
   */
  async updateLogo(logoUrl: string): Promise<void> {
    return this.updateSettings({ logo: logoUrl });
  }

  /**
   * Update banner
   */
  async updateBanner(bannerUrl: string): Promise<void> {
    return this.updateSettings({ banner: bannerUrl });
  }
}

export const settingsService = new SettingsService();
