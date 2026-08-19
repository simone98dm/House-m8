/**
 * Storage Provider Factory
 * Creates storage provider instances based on the configured database provider
 */

import type { IStorageProvider } from './IStorageProvider';

/**
 * Stub storage provider for when no storage is configured
 */
class StubStorageProvider implements IStorageProvider {
  async upload() {
    return {
      data: null,
      error:
        'Storage provider not configured. Please set up AWS S3 or local storage.',
    };
  }

  async delete() {
    return { error: 'Storage provider not configured.' };
  }

  getPublicUrl() {
    return '';
  }

  async deleteMany() {
    return { error: 'Storage provider not configured.' };
  }
}

/**
 * Get storage provider instance for the current request
 * @returns Storage provider instance
 */
export function getStorageProvider(): IStorageProvider {
  // For PostgreSQL or other providers, implement alternative storage
  // Options: Local filesystem, AWS S3, Cloudinary, etc.
  return new StubStorageProvider();
}
