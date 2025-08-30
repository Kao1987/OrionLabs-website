<template>
  <div class="image-upload-demo">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <h3 class="mb-4">圖片上傳功能示範</h3>
        </div>
      </div>

      <div class="row">
        <!-- Upload Section -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-cloud-upload me-2"></i>
                圖片上傳
              </h5>
            </div>
            <div class="card-body">
              <image-upload
                :multiple="true"
                :show-preview="true"
                :auto-upload="false"
                @upload-success="handleUploadSuccess"
                @upload-error="handleUploadError"
                @files-added="handleFilesAdded"
              />

              <!-- Upload Statistics -->
              <div v-if="uploadStats.total > 0" class="mt-3">
                <div class="row">
                  <div class="col-3">
                    <div class="text-center">
                      <div class="h4 mb-0 text-primary">{{ uploadStats.total }}</div>
                      <small class="text-muted">總計</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-center">
                      <div class="h4 mb-0 text-success">{{ uploadStats.success }}</div>
                      <small class="text-muted">成功</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-center">
                      <div class="h4 mb-0 text-warning">{{ uploadStats.pending }}</div>
                      <small class="text-muted">等待</small>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="text-center">
                      <div class="h4 mb-0 text-danger">{{ uploadStats.failed }}</div>
                      <small class="text-muted">失敗</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gallery Section -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-images me-2"></i>
                圖片畫廊
              </h5>
              <div>
                <button
                  v-if="galleryImages.length > 0"
                  @click="clearGallery"
                  class="btn btn-outline-danger btn-sm"
                >
                  <i class="bi bi-trash me-1"></i>
                  清空畫廊
                </button>
              </div>
            </div>
            <div class="card-body">
              <image-gallery
                :images="galleryImages"
                :allow-edit="true"
                :allow-delete="true"
                :allow-download="true"
                :allow-copy="true"
                @image-updated="handleImageUpdated"
                @image-deleted="handleImageDeleted"
                @image-clicked="handleImageClicked"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                使用說明
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>圖片上傳功能：</h6>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-check-circle text-success me-2"></i>支援拖放上傳</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>支援多檔案選擇</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>即時預覽</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>上傳進度顯示</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>檔案大小驗證</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>檔案格式驗證</li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6>圖片畫廊功能：</h6>
                  <ul class="list-unstyled">
                    <li><i class="bi bi-check-circle text-success me-2"></i>燈箱預覽</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>圖片編輯</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>圖片刪除</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>圖片下載</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>連結複製</li>
                    <li><i class="bi bi-check-circle text-success me-2"></i>鍵盤導航</li>
                  </ul>
                </div>
              </div>

              <div class="mt-3">
                <h6>支援格式：</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span class="badge bg-primary">JPEG</span>
                  <span class="badge bg-primary">JPG</span>
                  <span class="badge bg-primary">PNG</span>
                  <span class="badge bg-primary">GIF</span>
                  <span class="badge bg-primary">WebP</span>
                </div>
              </div>

              <div class="mt-3">
                <h6>限制：</h6>
                <p class="mb-0 text-muted">
                  最大檔案大小：{{ formatFileSize(maxFileSize) }} | 支援的圖片格式：JPEG, JPG, PNG,
                  GIF, WebP
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUploadStore } from "@/stores/upload";
import { useUIStore } from "@/stores/ui";
import ImageUpload from "@/components/ImageUpload.vue";
import ImageGallery from "@/components/ImageGallery.vue";

const uploadStore = useUploadStore();
const uiStore = useUIStore();

// State
const galleryImages = ref<Array<{ url: string; caption?: string; alt?: string }>>([]);

// Computed
const uploadStats = computed(() => {
  return {
    total: uploadStore.images.length,
    success: uploadStore.successfulImages.length,
    pending: uploadStore.pendingImages.length,
    failed: uploadStore.failedImages.length,
  };
});

const maxFileSize = computed(() => uploadStore.maxFileSize);

// Methods
const handleUploadSuccess = (urls: string[]) => {
  urls.forEach((url) => {
    galleryImages.value.push({
      url,
      caption: "",
      alt: "",
    });
  });

  uiStore.showSuccess("上傳成功", `已成功上傳 ${urls.length} 張圖片到畫廊`);
};

const handleUploadError = (error: Error) => {
  uiStore.showError("上傳失敗", error.message || "圖片上傳失敗");
};

const handleFilesAdded = (files: File[]) => {
  uiStore.showInfo("檔案已選擇", `已選擇 ${files.length} 個檔案`);
};

const handleImageUpdated = (
  index: number,
  image: { url: string; caption?: string; alt?: string },
) => {
  if (index >= 0 && index < galleryImages.value.length) {
    galleryImages.value[index] = image;
    uiStore.showSuccess("更新成功", "圖片資訊已更新");
  }
};

const handleImageDeleted = (index: number) => {
  if (index >= 0 && index < galleryImages.value.length) {
    galleryImages.value.splice(index, 1);
    uiStore.showSuccess("刪除成功", "圖片已從畫廊中移除");
  }
};

const handleImageClicked = (index: number) => {
  console.log("圖片被點擊:", index);
};

const clearGallery = () => {
  if (confirm("確定要清空整個畫廊嗎？")) {
    galleryImages.value = [];
    uploadStore.clearImages();
    uiStore.showSuccess("清空成功", "畫廊已清空");
  }
};

const formatFileSize = (bytes: number) => {
  return uploadStore.formatFileSize(bytes);
};
</script>

<style scoped>
.image-upload-demo {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
}

.card-header {
  background-color: white;
  border-bottom: 1px solid #e9ecef;
}

.h4 {
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
}
</style>
