import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { uploadAPI } from "@/services/api";

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

export interface UploadError {
  code: string;
  message: string;
  file?: string;
}

export const useUploadStore = defineStore("upload", () => {
  const images = ref<UploadedImage[]>([]);
  const isUploading = ref(false);
  const error = ref<UploadError | null>(null);
  const maxFileSize = ref(10 * 1024 * 1024); // 10MB
  const allowedTypes = ref(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]);

  const pendingImages = computed(() => images.value.filter((img) => img.status === "pending"));

  const uploadingImages = computed(() => images.value.filter((img) => img.status === "uploading"));

  const successfulImages = computed(() => images.value.filter((img) => img.status === "success"));

  const failedImages = computed(() => images.value.filter((img) => img.status === "error"));

  const hasError = computed(() => !!error.value);
  const hasUploads = computed(() => images.value.length > 0);

  const clearError = () => {
    error.value = null;
  };

  const setError = (err: UploadError) => {
    error.value = err;
  };

  const validateFile = (file: File): boolean => {
    clearError();

    if (!allowedTypes.value.includes(file.type)) {
      setError({
        code: "INVALID_TYPE",
        message: `不支援的檔案格式: ${file.type}`,
        file: file.name,
      });
      return false;
    }

    if (file.size > maxFileSize.value) {
      setError({
        code: "FILE_TOO_LARGE",
        message: `檔案大小超過限制 (${Math.round(maxFileSize.value / 1024 / 1024)}MB)`,
        file: file.name,
      });
      return false;
    }

    return true;
  };

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!validateFile(file)) continue;

      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const url = URL.createObjectURL(file);

      const uploadedImage: UploadedImage = {
        id,
        file,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: "pending",
        progress: 0,
      };

      images.value.push(uploadedImage);
    }
  };

  const removeImage = (id: string) => {
    const index = images.value.findIndex((img) => img.id === id);
    if (index > -1) {
      const image = images.value[index];
      URL.revokeObjectURL(image.url);
      images.value.splice(index, 1);
    }
  };

  const clearImages = () => {
    images.value.forEach((img) => {
      URL.revokeObjectURL(img.url);
    });
    images.value = [];
  };

  const updateImageStatus = (
    id: string,
    status: UploadedImage["status"],
    progress?: number,
    error?: string,
  ) => {
    const image = images.value.find((img) => img.id === id);
    if (image) {
      image.status = status;
      if (progress !== undefined) image.progress = progress;
      if (error) image.error = error;
    }
  };

  // 真實的上傳函數 - 替換 mock 版本
  const uploadImage = async (image: UploadedImage): Promise<string> => {
    updateImageStatus(image.id, "uploading", 0);

    try {
      // 使用真實的 API 上傳
      const result = await uploadAPI.uploadImage(image.file);
      updateImageStatus(image.id, "success", 100);
      return result.url;
    } catch (error: unknown) {
      const catchError = error as { message?: string };
      updateImageStatus(image.id, "error", 0, catchError.message || "Upload failed");
      throw error;
    }
  };

  const uploadImages = async (imageIds?: string[]): Promise<string[]> => {
    isUploading.value = true;
    clearError();

    const imagesToUpload = imageIds
      ? images.value.filter((img) => imageIds.includes(img.id) && img.status === "pending")
      : pendingImages.value;

    const uploadPromises = imagesToUpload.map(async (image) => {
      try {
        const url = await uploadImage(image);
        return url;
      } catch (error: unknown) {
        const catchError = error as { message?: string };
        setError({
          code: "UPLOAD_ERROR",
          message: catchError.message || "Upload failed",
          file: image.name,
        });
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch {
      // Ignore error
      throw error;
    } finally {
      isUploading.value = false;
    }
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    if (!validateFile(file)) {
      throw new Error(error.value?.message || "Invalid file");
    }

    addFiles([file]);
    const image = images.value[images.value.length - 1];
    const urls = await uploadImages([image.id]);
    return urls[0];
  };

  const retryUpload = async (id: string) => {
    const image = images.value.find((img) => img.id === id);
    if (image && image.status === "error") {
      updateImageStatus(id, "pending", 0);
      return uploadImages([id]);
    }
  };

  const getImagesByStatus = (status: UploadedImage["status"]) => {
    return images.value.filter((img) => img.status === status);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return {
    images,
    isUploading,
    error,
    maxFileSize,
    allowedTypes,
    pendingImages,
    uploadingImages,
    successfulImages,
    failedImages,
    hasError,
    hasUploads,
    clearError,
    setError,
    validateFile,
    addFiles,
    removeImage,
    clearImages,
    updateImageStatus,
    uploadImage,
    uploadImages,
    uploadSingleFile,
    retryUpload,
    getImagesByStatus,
    formatFileSize,
  };
});
