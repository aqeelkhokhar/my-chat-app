// Cloudinary service for uploading and managing photos
// Free tier: 25 credits/month (~25GB storage, 25GB bandwidth)

import ReactNativeBlobUtil from 'react-native-blob-util';

// Configuration
const CLOUDINARY_CLOUD_NAME = 'dp8rmvnmb';
const CLOUDINARY_UPLOAD_PRESET = 'my_chat_preset';

/**
 * Get file path from URI (removes file:// prefix)
 */
function getFilePath(uri: string): string {
  if (uri.startsWith('file://')) {
    return uri.substring(7);
  }
  return uri;
}

/**
 * Get file name from URI
 */
function getFileName(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] || `image_${Date.now()}.jpg`;
}

/**
 * Get mime type from file name
 */
function getMimeType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  return mimeTypes[extension] || 'image/jpeg';
}

/**
 * Upload image to Cloudinary using base64 encoding
 * Uses react-native-blob-util to read the file properly on Android
 * @param uri - Local file URI of the image
 * @param folder - Folder path in Cloudinary (e.g., 'profiles' or 'chats')
 * @param onProgress - Optional progress callback
 * @returns Promise with the secure URL
 */
export async function uploadToCloudinary(
  uri: string,
  folder: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const filePath = getFilePath(uri);
  const fileName = getFileName(uri);
  const mimeType = getMimeType(fileName);

  console.log('Reading file for Cloudinary upload:', { filePath, fileName });

  try {
    // Read file as base64
    const base64Data = await ReactNativeBlobUtil.fs.readFile(
      filePath,
      'base64',
    );

    console.log('File read successfully, uploading to Cloudinary...');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Upload using base64 data URI
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: `data:${mimeType};base64,${base64Data}`,
        upload_preset: CLOUDINARY_UPLOAD_PRESET,
        folder: folder,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload success:', data.secure_url);

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload a profile photo to Cloudinary
 * @param userId - The user's ID
 * @param uri - Local file URI of the image
 * @returns Promise with the download URL
 */
export async function uploadProfilePhoto(
  userId: string,
  uri: string,
): Promise<string> {
  console.log('Uploading profile photo:', { userId, uri });
  return uploadToCloudinary(uri, `chat-app/profiles/${userId}`);
}

/**
 * Upload a chat photo to Cloudinary
 * @param userId - The sender's user ID
 * @param chatId - The chat/conversation ID
 * @param uri - Local file URI of the image
 * @returns Promise with the download URL
 */
export async function uploadChatPhoto(
  userId: string,
  chatId: string,
  uri: string,
): Promise<string> {
  console.log('Uploading chat photo:', { userId, chatId, uri });
  return uploadToCloudinary(uri, `chat-app/chats/${chatId}`);
}

/**
 * Get optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: number } = {},
): string {
  const { width, height, quality = 80 } = options;

  // Insert transformations into Cloudinary URL
  // Format: https://res.cloudinary.com/CLOUD_NAME/image/upload/TRANSFORMATIONS/...
  const transformations: string[] = [`q_${quality}`];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);

  const transformString = transformations.join(',');

  // Insert after /upload/
  return url.replace('/upload/', `/upload/${transformString}/`);
}
