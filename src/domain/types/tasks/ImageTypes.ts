export interface ImageAsset {
  uri: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  width?: number;
  height?: number;
  base64?: string;
}

export interface CompressedImage {
  uri: string;
  base64: string;
  size: number;
  width: number;
  height: number;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

