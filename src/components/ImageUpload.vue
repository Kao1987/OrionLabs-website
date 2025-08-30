<template>
  <div class="image-upload">
    <!-- Upload Area -->
    <div
      class="upload-area"
      :class="{
        dragover: isDragOver,
        disabled: disabled,
      }"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="!disabled && openFileDialog()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="d-none"
        :disabled="disabled"
      />

      <div class="upload-content text-center">
        <div v-if="isUploading" class="uploading-state">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">上傳中...</span>
          </div>
          <h5>上傳中...</h5>
          <p class="text-muted">請稍候</p>
        </div>
        <div v-else class="upload-prompt">
          <i class="bi bi-cloud-upload display-1 text-muted mb-3"></i>
          <h5>拖放圖片到此處或點擊上傳</h5>
          <p class="text-muted mb-2">支援格式: {{ supportedFormats }}</p>
          <p class="text-muted small">最大檔案大小: {{ formatFileSize(maxFileSize) }}</p>
          <button type="button" class="btn btn-outline-primary mt-2" :disabled="disabled">
            <i class="bi bi-plus me-1"></i>
            選擇檔案
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-danger mt-3" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error.message }}
      <button type="button" class="btn-close" @click="clearError"></button>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadingImages.length > 0" class="upload-progress mt-3">
      <h6>上傳進度</h6>
      <div v-for="image in uploadingImages" :key="image.id" class="progress-item mb-2">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-muted">{{ image.name }}</small>
          <small class="text-muted">{{ image.progress }}%</small>
        </div>
        <div class="progress">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: image.progress + '%' }"
            :aria-valuenow="image.progress"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </div>

    <!-- Image Preview -->
    <div v-if="showPreview && hasUploads" class="image-preview mt-4">
      <h6>已選擇的圖片</h6>
      <div class="row g-3">
        <div v-for="image in images" :key="image.id" class="col-md-4 col-sm-6">
          <div class="preview-card">
            <div class="position-relative">
              <img
                :src="image.url"
                :alt="image.name"
                class="preview-image"
                @load="handleImageLoad"
                @error="handleImageError"
              />
              <div class="preview-overlay">
                <div class="preview-actions">
                  <button
                    v-if="image.status === 'error'"
                    @click="retryUpload(image.id)"
                    class="btn btn-sm btn-warning me-1"
                    title="重試上傳"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                  <button
                    @click="removeImage(image.id)"
                    class="btn btn-sm btn-danger"
                    title="移除圖片"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div class="status-badge">
                <span
                  class="badge"
                  :class="{
                    'bg-warning': image.status === 'pending',
                    'bg-info': image.status === 'uploading',
                    'bg-success': image.status === 'success',
                    'bg-danger': image.status === 'error',
                  }"
                >
                  <i
                    class="bi"
                    :class="{
                      'bi-clock': image.status === 'pending',
                      'bi-arrow-up': image.status === 'uploading',
                      'bi-check': image.status === 'success',
                      'bi-x': image.status === 'error',
                    }"
                  ></i>
                  {{ getStatusText(image.status) }}
                </span>
              </div>
            </div>
            <div class="preview-info p-2">
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted text-truncate me-2">{{ image.name }}</small>
                <small class="text-muted">{{ formatFileSize(image.size) }}</small>
              </div>
              <div v-if="image.error" class="text-danger small mt-1">
                {{ image.error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div v-if="hasUploads" class="upload-actions mt-3">
      <button
        v-if="pendingImages.length > 0"
        @click="uploadAll"
        class="btn btn-primary me-2"
        :disabled="isUploading"
      >
        <span v-if="isUploading" class="spinner-border spinner-border-sm me-1" role="status"></span>
        <i v-else class="bi bi-cloud-upload me-1"></i>
        上傳全部 ({{ pendingImages.length }})
      </button>
      <button @click="clearAll" class="btn btn-outline-secondary" :disabled="isUploading">
        <i class="bi bi-trash me-1"></i>
        清除全部
      </button>
      <div v-if="successfulImages.length > 0" class="mt-2">
        <small class="text-success">
          <i class="bi bi-check-circle me-1"></i>
          已成功上傳 {{ successfulImages.length }} 張圖片
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useUploadStore } from "@/stores/upload";

interface Props {
  multiple?: boolean;
  showPreview?: boolean;
  disabled?: boolean;
  autoUpload?: boolean;
  accept?: string;
}

interface Emits {
  (e: "upload-success", urls: string[]): void;
  (e: "upload-error", error: Error): void;
  (e: "files-added", files: File[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  showPreview: true,
  disabled: false,
  autoUpload: false,
  accept: "image/*",
});

const emit = defineEmits<Emits>();

const uploadStore = useUploadStore();

// Store getters
const {
  images,
  isUploading,
  error,
  maxFileSize,
  allowedTypes,
  pendingImages,
  uploadingImages,
  successfulImages,
  hasUploads,
  formatFileSize,
} = uploadStore;

// Component state
const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);
const dragCounter = ref(0);

// Computed
const acceptedTypes = computed(() => {
  return props.accept || allowedTypes.join(",");
});

const supportedFormats = computed(() => {
  return allowedTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ");
});

// Methods
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    handleFiles(target.files);
    target.value = ""; // Reset input
  }
};

const handleFiles = async (files: FileList) => {
  const fileArray = Array.from(files);

  if (!props.multiple && fileArray.length > 1) {
    uploadStore.setError({
      code: "MULTIPLE_NOT_ALLOWED",
      message: "只能選擇一個檔案",
    });
    return;
  }

  uploadStore.addFiles(files);
  emit("files-added", fileArray);

  if (props.autoUpload && pendingImages.length > 0) {
    await uploadAll();
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  dragCounter.value = 0;

  if (props.disabled) return;

  const files = event.dataTransfer?.files;
  if (files) {
    handleFiles(files);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value++;
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragOver.value = false;
  }
};

const handleImageLoad = () => {
  // Image loaded successfully
};

const handleImageError = () => {
  console.error("Failed to load image preview");
};

const uploadAll = async () => {
  try {
    const urls = await uploadStore.uploadImages();
    emit("upload-success", urls);
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    emit("upload-error", errorObj);
  }
};

const removeImage = (id: string) => {
  uploadStore.removeImage(id);
};

const clearAll = () => {
  uploadStore.clearImages();
};

const retryUpload = async (id: string) => {
  try {
    await uploadStore.retryUpload(id);
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    emit("upload-error", errorObj);
  }
};

const clearError = () => {
  uploadStore.clearError();
};

const getStatusText = (status: string) => {
  const statusMap = {
    pending: "等待",
    uploading: "上傳中",
    success: "完成",
    error: "失敗",
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

// Lifecycle
onMounted(() => {
  // Prevent default drag behaviors on document
  const preventDefaults = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.addEventListener("dragenter", preventDefaults);
  document.addEventListener("dragover", preventDefaults);
  document.addEventListener("dragleave", preventDefaults);
  document.addEventListener("drop", preventDefaults);
});

onUnmounted(() => {
  // Clean up
  uploadStore.clearImages();
});
</script>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 3rem 2rem;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover:not(.disabled) {
  border-color: #0d6efd;
  background-color: #f0f8ff;
}

.upload-area.dragover {
  border-color: #0d6efd;
  background-color: #e7f3ff;
  transform: scale(1.02);
}

.upload-area.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-content {
  width: 100%;
}

.display-1 {
  font-size: 3rem;
}

.progress-item {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 0.375rem;
}

.preview-card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-card:hover .preview-overlay {
  opacity: 1;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
}

.status-badge .badge {
  font-size: 0.7rem;
}

.preview-info {
  background: white;
}

.upload-actions {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.text-truncate {
  max-width: 150px;
}
</style>
