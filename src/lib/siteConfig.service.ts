import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { FirestoreService } from './firestore.service';
import type { SiteConfig } from './types';

class SiteConfigService extends FirestoreService<SiteConfig> {
  private static CONFIG_ID = 'main'; // Single config document

  constructor() {
    super('siteConfig');
  }

  /**
   * Get the site configuration
   */
  async getConfig(): Promise<SiteConfig | null> {
    try {
      const config = await this.getById(SiteConfigService.CONFIG_ID);
      return config;
    } catch (error) {
      console.error('Failed to get site config:', error);
      return null;
    }
  }

  /**
   * Update the site configuration
   */
  async updateConfig(data: Partial<SiteConfig>): Promise<void> {
    try {
      await this.update(SiteConfigService.CONFIG_ID, data);
    } catch (error) {
      // If config doesn't exist, create it
      const fullConfig: SiteConfig = {
        siteName: data.siteName || 'Mì cay yummy',
        siteIcon: data.siteIcon || '🍜',
        tagline: data.tagline || '',
        address: data.address || '',
        addressDetail: data.addressDetail || '',
        country: data.country || 'Việt Nam',
        phone: data.phone || '',
        email: data.email || '',
        facebook: data.facebook || '',
        zalo: data.zalo || '',
        openingHours: data.openingHours || {
          monday: { open: '07:30', close: '21:00' },
          tuesday: { open: '07:30', close: '21:00' },
          wednesday: { open: '07:30', close: '21:00' },
          thursday: { open: '07:30', close: '21:00' },
          friday: { open: '07:30', close: '21:00' },
          saturday: { open: '08:00', close: '20:30' },
          sunday: { open: '08:00', close: '20:30' },
        },
        copyrightText: data.copyrightText || '',
      };
      const docRef = doc(db, 'siteConfig', SiteConfigService.CONFIG_ID);
      await setDoc(docRef, fullConfig);
    }
  }

  /**
   * Subscribe to site config changes
   */
  subscribeToConfig(callback: (config: SiteConfig | null) => void): () => void {
    const docRef = doc(db, 'siteConfig', SiteConfigService.CONFIG_ID);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as SiteConfig);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Initialize default config if not exists
   */
  async initializeDefaultConfig(): Promise<void> {
    const existing = await this.getConfig();
    if (!existing) {
      await this.updateConfig({
        siteName: 'Mì cay yummy',
        siteIcon: '🍜',
        tagline: 'Thưởng thức tô mì cay chuẩn vị Hàn Quốc, sợi mì dai đàn, nước dùng đậm đà, topping đa dạng. Không gian quán ấm cúng, phục vụ tận tâm, là điểm đến lý tưởng cho những ai yêu thích vị cay nồng và trải nghiệm ẩm thực đặc sắc.',
        address: '588/6 Cách Mạng Tháng 8',
        addressDetail: 'Phường Bà Rịa, TP.HCM',
        country: 'Việt Nam',
        phone: '0988 994 799',
        facebook: 'Điều Hiển',
        zalo: '0988 994 799',
        openingHours: {
          monday: { open: '07:30', close: '21:00' },
          tuesday: { open: '08:00', close: '20:30', closed: false },
          wednesday: { open: '07:30', close: '21:00' },
          thursday: { open: '07:30', close: '21:00' },
          friday: { open: '07:30', close: '21:00' },
          saturday: { open: '07:30', close: '20:30' },
          sunday: { open: '07:30', close: '20:30' },
        },
        copyrightText: '© 2025 Mì cay yummy. Tất cả quyền được bảo lưu.',
      });
    }
  }
}

export const siteConfigService = new SiteConfigService();
