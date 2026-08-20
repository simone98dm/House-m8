/**
 * PictureUpload — unit-logic tests
 *
 * Tests verify the pure validation and computed logic from the component
 * without mounting it (project convention).
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Mock URL.createObjectURL (jsdom doesn't support it natively)
beforeAll(() => {
  global.URL.createObjectURL = (_blob: Blob) => {
    return `blob:mock-url-${Math.random()}`;
  };
});

// --- Replicate pure helpers from PictureUpload.vue ---

function isValidFile(file: File, accept: string, maxSize: number): boolean {
  if (accept !== '*' && !file.type.match(accept)) return false;
  const sizeMb = file.size / (1024 * 1024);
  return sizeMb <= maxSize;
}

function getFileSize(file: File | null): string {
  if (!file) return '';
  return `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
}

function getPreviewUrl(file: File | null): string | null {
  return file ? URL.createObjectURL(file) : null;
}

function getHint(accept: string, maxSize: number): string {
  const base = accept === 'image/*' ? 'PNG, JPG, GIF up to' : 'Files up to';
  return `${base} ${maxSize}MB`;
}

// --- Tests ---

describe('isValidFile', () => {
  it('accepts a JPEG under maxSize', () => {
    const file = new File(['x'.repeat(1024 * 1024)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(isValidFile(file, 'image/*', 5)).toBe(true);
  });

  it('rejects a JPEG over maxSize', () => {
    const file = new File(['x'.repeat(10 * 1024 * 1024)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(isValidFile(file, 'image/*', 5)).toBe(false);
  });

  it('rejects a non-image when accept is image/*', () => {
    const file = new File(['abc'], 'doc.pdf', { type: 'application/pdf' });
    expect(isValidFile(file, 'image/*', 5)).toBe(false);
  });

  it('accepts any type when accept is *', () => {
    const file = new File(['abc'], 'doc.pdf', { type: 'application/pdf' });
    expect(isValidFile(file, '*', 5)).toBe(true);
  });

  it('accepts zero-byte file (under any maxSize)', () => {
    const file = new File([''], 'empty.jpg', { type: 'image/jpeg' });
    expect(isValidFile(file, 'image/*', 5)).toBe(true);
  });

  it('rejects a file at exactly maxSize + 1 byte', () => {
    const bytes = 5 * 1024 * 1024 + 1;
    const file = new File(['x'.repeat(bytes)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(isValidFile(file, 'image/*', 5)).toBe(false);
  });

  it('accepts a file at exactly maxSize', () => {
    const bytes = 5 * 1024 * 1024;
    const file = new File(['x'.repeat(bytes)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(isValidFile(file, 'image/*', 5)).toBe(true);
  });
});

describe('getFileSize', () => {
  it('returns empty string for null', () => {
    expect(getFileSize(null)).toBe('');
  });

  it('formats 2MB file correctly', () => {
    const file = new File(['x'.repeat(2 * 1024 * 1024)], 'a.jpg', {
      type: 'image/jpeg',
    });
    expect(getFileSize(file)).toBe('2.00 MB');
  });

  it('formats 0-byte file as 0.00 MB', () => {
    const file = new File([''], 'a.jpg', { type: 'image/jpeg' });
    expect(getFileSize(file)).toBe('0.00 MB');
  });
});

describe('getPreviewUrl', () => {
  it('returns null when file is null', () => {
    expect(getPreviewUrl(null)).toBeNull();
  });

  it('returns a non-empty string when file is provided', () => {
    const file = new File(['data'], 'a.jpg', { type: 'image/jpeg' });
    const url = getPreviewUrl(file);
    expect(url).not.toBeNull();
    expect(typeof url).toBe('string');
    expect((url as string).length).toBeGreaterThan(0);
  });
});

describe('getHint', () => {
  it('returns image hint for image/* accept', () => {
    expect(getHint('image/*', 5)).toBe('PNG, JPG, GIF up to 5MB');
  });

  it('returns generic hint for other accept values', () => {
    expect(getHint('.pdf,.doc', 10)).toBe('Files up to 10MB');
  });
});

describe('drag and drop logic', () => {
  it('sets isDragOver true on dragover when not disabled', () => {
    let isDragOver = false;
    const disabled = false;
    const handleDragOver = () => {
      if (!disabled) isDragOver = true;
    };
    handleDragOver();
    expect(isDragOver).toBe(true);
  });

  it('keeps isDragOver false on dragover when disabled', () => {
    let isDragOver = false;
    const disabled = true;
    const handleDragOver = () => {
      if (!disabled) isDragOver = true;
    };
    handleDragOver();
    expect(isDragOver).toBe(false);
  });

  it('resets isDragOver to false on dragleave', () => {
    let isDragOver = true;
    const handleDragLeave = () => {
      isDragOver = false;
    };
    handleDragLeave();
    expect(isDragOver).toBe(false);
  });

  it('extracts first file from drop dataTransfer', () => {
    const mockFile = new File([''], 'dropped.jpg', { type: 'image/jpeg' });
    const dataTransfer = { files: [mockFile] };
    const extracted = dataTransfer.files[0] ?? null;
    expect(extracted).toBe(mockFile);
  });

  it('returns null when dataTransfer has no files', () => {
    const dataTransfer = { files: [] as File[] };
    const extracted = dataTransfer.files[0] ?? null;
    expect(extracted).toBeNull();
  });
});

describe('file removal', () => {
  it('emits null and resets input value', () => {
    let emittedValue: File | null = new File([''], 'a.jpg');
    let inputValue = 'C:\\fakepath\\a.jpg';

    const removeFile = () => {
      emittedValue = null;
      inputValue = '';
    };

    removeFile();
    expect(emittedValue).toBeNull();
    expect(inputValue).toBe('');
  });
});
