// Image Storage Service - Upload and manage images in Firebase Storage
import { storage, db } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';

export interface ImageMetadata {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy?: string;
}

const IMAGES_COLLECTION = 'uploaded_images';
const STORAGE_PATH = 'restaurant_images';

class ImageStorageService {
  /**
   * Upload an image to Firebase Storage and save metadata to Firestore
   */
  async uploadImage(
    file: File,
    uploadedBy?: string
  ): Promise<ImageMetadata> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const storagePath = `${STORAGE_PATH}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // Get download URL
      const url = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const metadata: Omit<ImageMetadata, 'id'> = {
        name: file.name,
        url,
        path: storagePath,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        uploadedBy,
      };

      const docRef = await addDoc(collection(db, IMAGES_COLLECTION), {
        ...metadata,
        uploadedAt: Timestamp.fromDate(metadata.uploadedAt),
      });

      return {
        id: docRef.id,
        ...metadata,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  }

  /**
   * Get all uploaded images from Firestore
   */
  async getAllImages(): Promise<ImageMetadata[]> {
    try {
      // Get all documents without orderBy to avoid index requirement
      const snapshot = await getDocs(collection(db, IMAGES_COLLECTION));

      const images = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          url: data.url || '',
          path: data.path || '',
          size: data.size || 0,
          type: data.type || 'image/jpeg',
          uploadedAt:
            data.uploadedAt instanceof Timestamp
              ? data.uploadedAt.toDate()
              : new Date(data.uploadedAt || Date.now()),
          uploadedBy: data.uploadedBy,
        };
      });

      // Sort by uploadedAt in client
      return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    } catch (error) {
      console.error('Error getting images:', error);
      // Return empty array instead of throwing to allow page to load
      return [];
    }
  }

  /**
   * Delete an image from Storage and Firestore
   */
  async deleteImage(imageId: string, imagePath: string): Promise<void> {
    try {
      // Delete from Storage
      const storageRef = ref(storage, imagePath);
      await deleteObject(storageRef);

      // Delete metadata from Firestore
      await deleteDoc(doc(db, IMAGES_COLLECTION, imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Không thể xóa ảnh. Vui lòng thử lại.');
    }
  }

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)',
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Kích thước file không được vượt quá 5MB',
      };
    }

    return { valid: true };
  }
}

export const imageStorageService = new ImageStorageService();
