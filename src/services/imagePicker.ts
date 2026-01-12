import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';

export type ImagePickerResult = {
  success: boolean;
  uri?: string;
  fileName?: string;
  type?: string;
  width?: number;
  height?: number;
  error?: string;
};

/**
 * Pick an image from the device gallery
 */
export async function pickImageFromGallery(): Promise<ImagePickerResult> {
  try {
    const response: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 1,
    });

    if (response.didCancel) {
      return { success: false, error: 'User cancelled' };
    }

    if (response.errorCode) {
      return {
        success: false,
        error: response.errorMessage || 'Unknown error',
      };
    }

    const asset: Asset | undefined = response.assets?.[0];
    if (!asset?.uri) {
      return { success: false, error: 'No image selected' };
    }

    return {
      success: true,
      uri: asset.uri,
      fileName: asset.fileName,
      type: asset.type,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pick image',
    };
  }
}

/**
 * Take a photo using the device camera
 */
export async function takePhoto(): Promise<ImagePickerResult> {
  try {
    const response: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: false,
    });

    if (response.didCancel) {
      return { success: false, error: 'User cancelled' };
    }

    if (response.errorCode) {
      return {
        success: false,
        error: response.errorMessage || 'Unknown error',
      };
    }

    const asset: Asset | undefined = response.assets?.[0];
    if (!asset?.uri) {
      return { success: false, error: 'No photo taken' };
    }

    return {
      success: true,
      uri: asset.uri,
      fileName: asset.fileName,
      type: asset.type,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to take photo',
    };
  }
}
