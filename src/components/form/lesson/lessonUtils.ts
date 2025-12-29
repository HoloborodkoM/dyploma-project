const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/',
  'text/plain'
];

function isAllowedType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type =>
    type.endsWith('/')
      ? file.type.startsWith(type)
      : file.type === type
  ) || file.name.endsWith('.txt') || file.name.endsWith('.doc') || file.name.endsWith('.docx');
}

function isFileSizeValid(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export const lessonUtils = {
  formatFileName: (fileName: string, maxLength: number = 45): string => {
    if (!fileName) return '';
    
    if (fileName.length <= maxLength) {
      return fileName;
    }
    
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
    
    const name = fileName.substring(0, lastDotIndex !== -1 ? lastDotIndex : fileName.length);
    const truncatedName = name.substring(0, maxLength - 3 - extension.length) + '...';
    
    return truncatedName + extension;
  },
  isValidVideoType: (fileType: string): boolean => {
    return fileType.startsWith('video/');
  },
  isValidDocumentType: (fileType: string): boolean =>
    allowedDocumentTypes.some(type => type.endsWith('/') ? fileType.startsWith(type) : fileType === type)
};

export const formatFileName = (fileName: string, maxLength: number = 45): string => {
  return lessonUtils.formatFileName(fileName, maxLength);
};

export const validateVideoFile = (
  file: File,
  invalidFormatErrorText: string,
  sizeExceededErrorText: string
): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: invalidFormatErrorText };
  }
  if (!isFileSizeValid(file, 200)) {
    return { valid: false, error: sizeExceededErrorText };
  }
  return { valid: true };
};

export const validateDocumentFile = (
  file: File,
  invalidFormatErrorText: string,
  sizeExceededErrorText: string
): { valid: boolean; error?: string } => {
  if (!isAllowedType(file, allowedDocumentTypes)) {
    return { valid: false, error: invalidFormatErrorText };
  }
  if (!isFileSizeValid(file, 50)) {
    return { valid: false, error: sizeExceededErrorText };
  }
  return { valid: true };
};