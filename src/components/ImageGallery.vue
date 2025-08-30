<template>
  <section class="media-gallery" :class="[`media-gallery--${variant}`, `media-gallery--cols-${columns}`]">
    <!-- Empty State -->
    <div v-if="images.length === 0" class="media-gallery__empty-state">
      <div class="media-gallery__empty-icon">
        <i class="bi bi-images" aria-hidden="true"></i>
      </div>
      <h3 class="media-gallery__empty-title">{{ emptyStateTitle }}</h3>
      <p class="media-gallery__empty-description">{{ emptyStateMessage }}</p>
      <slot name="empty-actions"></slot>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="media-gallery__grid" :style="{ '--gallery-columns': columns }">
      <article
        v-for="(image, index) in images"
        :key="`image-${index}-${typeof image === 'string' ? image : image.url}`"
        class="media-gallery__item"
        @click="openLightbox(index)"
        @keydown.enter="openLightbox(index)"
        @keydown.space.prevent="openLightbox(index)"
        tabindex="0"
        :aria-label="`查看圖片 ${index + 1}`"
      >
        <div class="media-gallery__item-container">
          <!-- Image -->
          <div class="media-gallery__image-wrapper">
            <img
              :src="typeof image === 'string' ? image : image.url"
              :alt="getImageAlt(image, index)"
              class="media-gallery__image"
              @error="handleImageError"
              @load="handleImageLoad($event, index)"
              :loading="props.loadingStrategy"
              :decoding="'async'"
              :data-index="index"
            />
            
            <!-- Loading placeholder -->
            <div class="media-gallery__loading" v-if="!imageLoaded[index]">
              <div class="media-gallery__loading-spinner"></div>
            </div>
            
            <!-- Hover Overlay -->
            <div class="media-gallery__overlay" :class="{ 'media-gallery__overlay--visible': showOverlay }">
              <div class="media-gallery__overlay-content">
                <!-- Action Buttons -->
                <div class="media-gallery__actions">
                  <button
                    v-if="allowEdit"
                    @click.stop="editImage(index)"
                    class="media-gallery__action-btn media-gallery__action-btn--edit"
                    :aria-label="`編輯圖片 ${index + 1}`"
                    title="編輯"
                  >
                    <i class="bi bi-pencil" aria-hidden="true"></i>
                  </button>
                  
                  <button
                    @click.stop="viewImage(index)"
                    class="media-gallery__action-btn media-gallery__action-btn--view"
                    :aria-label="`查看圖片 ${index + 1}`"
                    title="查看大圖"
                  >
                    <i class="bi bi-eye" aria-hidden="true"></i>
                  </button>
                  
                  <button
                    v-if="allowDownload"
                    @click.stop="downloadImageFromGallery(index)"
                    class="media-gallery__action-btn media-gallery__action-btn--download"
                    :aria-label="`下載圖片 ${index + 1}`"
                    title="下載"
                  >
                    <i class="bi bi-download" aria-hidden="true"></i>
                  </button>
                  
                  <button
                    v-if="allowDelete"
                    @click.stop="deleteImage(index)"
                    class="media-gallery__action-btn media-gallery__action-btn--delete"
                    :aria-label="`刪除圖片 ${index + 1}`"
                    title="刪除"
                  >
                    <i class="bi bi-trash" aria-hidden="true"></i>
                  </button>
                </div>
                
                <!-- Image Info -->
                <div class="media-gallery__info" v-if="showImageInfo">
                  <span class="media-gallery__index">{{ index + 1 }} / {{ images.length }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Caption -->
          <div 
            v-if="typeof image === 'object' && image.caption" 
            class="media-gallery__caption"
          >
            <p class="media-gallery__caption-text">{{ image.caption }}</p>
          </div>
        </div>
      </article>
    </div>

    <!-- Lightbox Modal -->
    <div 
      v-if="lightboxOpen" 
      class="media-lightbox"
      @click="closeLightbox"
      @keydown.esc="closeLightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="`圖片檢視器 - 圖片 ${currentImageIndex + 1}`"
    >
      <div class="media-lightbox__backdrop"></div>
      
      <div class="media-lightbox__content" @click.stop>
        <!-- Close Button -->
        <button 
          class="media-lightbox__close" 
          @click="closeLightbox"
          aria-label="關閉圖片檢視器"
          title="關閉 (Esc)"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <!-- Image Container -->
        <div class="media-lightbox__image-container">
          <img
            v-if="currentImage"
            :src="typeof currentImage === 'string' ? currentImage : currentImage.url"
            :alt="getImageAlt(currentImage, currentImageIndex)"
            class="media-lightbox__image"
          />
          
          <!-- Loading state -->
          <div v-if="lightboxLoading" class="media-lightbox__loading">
            <div class="media-lightbox__loading-spinner"></div>
          </div>
        </div>

        <!-- Navigation (if multiple images) -->
        <div v-if="images.length > 1" class="media-lightbox__navigation">
          <button
            class="media-lightbox__nav-btn media-lightbox__nav-btn--prev"
            @click="previousImage"
            :disabled="currentImageIndex === 0"
            :aria-label="`上一張圖片`"
            title="上一張 (←)"
          >
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
          
          <div class="media-lightbox__counter">
            <span class="media-lightbox__counter-text">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </span>
          </div>
          
          <button
            class="media-lightbox__nav-btn media-lightbox__nav-btn--next"
            @click="nextImage"
            :disabled="currentImageIndex === images.length - 1"
            :aria-label="`下一張圖片`"
            title="下一張 (→)"
          >
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Image Caption -->
        <div v-if="currentImage && currentImage.caption" class="media-lightbox__caption">
          <p class="media-lightbox__caption-text">{{ currentImage.caption }}</p>
        </div>

        <!-- Action Bar -->
        <div class="media-lightbox__actions">
          <button 
            v-if="allowDownload" 
            @click="downloadImage" 
            class="media-lightbox__action-btn media-lightbox__action-btn--download"
            aria-label="下載當前圖片"
            title="下載圖片"
          >
            <i class="bi bi-download" aria-hidden="true"></i>
            <span class="media-lightbox__action-text">下載</span>
          </button>
          
          <button 
            v-if="allowCopy" 
            @click="copyImageUrl" 
            class="media-lightbox__action-btn media-lightbox__action-btn--copy"
            aria-label="複製圖片連結"
            title="複製連結"
          >
            <i class="bi bi-clipboard" aria-hidden="true"></i>
            <span class="media-lightbox__action-text">複製連結</span>
          </button>
          
          <button 
            v-if="allowShare" 
            @click="shareImage" 
            class="media-lightbox__action-btn media-lightbox__action-btn--share"
            aria-label="分享圖片"
            title="分享"
          >
            <i class="bi bi-share" aria-hidden="true"></i>
            <span class="media-lightbox__action-text">分享</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Image Modal -->
    <div
      v-if="editModalOpen"
      class="media-edit-modal"
      @click.self="closeEditModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div class="media-edit-modal__backdrop"></div>
      
      <div class="media-edit-modal__dialog">
        <div class="media-edit-modal__content">
          <!-- Header -->
          <header class="media-edit-modal__header">
            <h3 id="edit-modal-title" class="media-edit-modal__title">編輯圖片</h3>
            <button 
              type="button" 
              class="media-edit-modal__close"
              @click="closeEditModal"
              aria-label="關閉編輯視窗"
              title="關閉"
            >
              <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
          </header>
          
          <!-- Form Body -->
          <div class="media-edit-modal__body">
            <form @submit.prevent="saveImageEdit" class="media-edit-modal__form">
              <!-- Caption Field -->
              <div class="media-edit-modal__field">
                <label class="media-edit-modal__label" for="edit-caption">
                  圖片說明
                </label>
                <input
                  id="edit-caption"
                  v-model="editingImage.caption"
                  type="text"
                  class="media-edit-modal__input"
                  placeholder="輸入圖片說明..."
                />
              </div>
              
              <!-- Alt Text Field -->
              <div class="media-edit-modal__field">
                <label class="media-edit-modal__label" for="edit-alt">
                  替代文字 (Alt) <span class="media-edit-modal__required">*</span>
                </label>
                <input
                  id="edit-alt"
                  v-model="editingImage.alt"
                  type="text"
                  class="media-edit-modal__input"
                  placeholder="輸入替代文字..."
                />
                <small class="media-edit-modal__help-text">
                  替代文字有助於螢幕閱讀器使用者理解圖片內容
                </small>
              </div>
              
              <!-- URL Field -->
              <div class="media-edit-modal__field">
                <label class="media-edit-modal__label" for="edit-url">
                  圖片 URL
                </label>
                <input
                  id="edit-url"
                  v-model="editingImage.url"
                  type="url"
                  class="media-edit-modal__input media-edit-modal__input--readonly"
                  placeholder="https://example.com/image.jpg"
                  readonly
                />
              </div>
            </form>
          </div>
          
          <!-- Footer -->
          <footer class="media-edit-modal__footer">
            <div class="media-edit-modal__actions">
              <button 
                type="button" 
                class="media-edit-modal__btn media-edit-modal__btn--secondary" 
                @click="closeEditModal"
              >
                取消
              </button>
              <button 
                type="button" 
                class="media-edit-modal__btn media-edit-modal__btn--primary" 
                @click="saveImageEdit"
              >
                儲存變更
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";

interface ImageItem {
  url: string;
  caption?: string;
  alt?: string;
  thumbnail?: string;
}

interface MediaGalleryProps {
  images: (string | ImageItem)[];
  variant?: 'grid' | 'masonry' | 'carousel' | 'minimal';
  columns?: number;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowDownload?: boolean;
  allowCopy?: boolean;
  allowShare?: boolean;
  showOverlay?: boolean;
  showImageInfo?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  loadingStrategy?: 'lazy' | 'eager';
}

interface MediaGalleryEmits {
  (e: "image-updated", index: number, image: ImageItem): void;
  (e: "image-deleted", index: number): void;
  (e: "image-clicked", index: number): void;
  (e: "image-loaded", index: number): void;
  (e: "image-error", index: number): void;
  (e: "lightbox-opened", index: number): void;
  (e: "lightbox-closed"): void;
}

const props = withDefaults(defineProps<MediaGalleryProps>(), {
  variant: 'grid',
  columns: 3,
  allowEdit: true,
  allowDelete: true,
  allowDownload: true,
  allowCopy: true,
  allowShare: false,
  showOverlay: true,
  showImageInfo: true,
  aspectRatio: 'auto',
  emptyStateTitle: '暫無圖片',
  emptyStateMessage: '尚未新增任何圖片',
  loadingStrategy: 'lazy'
});

const emit = defineEmits<MediaGalleryEmits>();

// State
const lightboxOpen = ref(false);
const lightboxLoading = ref(false);
const editModalOpen = ref(false);
const currentImageIndex = ref(0);
const editingImageIndex = ref(-1);
const editingImage = ref<ImageItem>({
  url: "",
  caption: "",
  alt: "",
});
const imageLoaded = reactive<boolean[]>([]);
const imageErrors = reactive<boolean[]>([]);

// Computed
const currentImage = computed(() => {
  if (currentImageIndex.value >= 0 && currentImageIndex.value < props.images.length) {
    const img = props.images[currentImageIndex.value];
    return typeof img === "string" ? { url: img } : img;
  }
  return null;
});

// Utility Methods
const getImageAlt = (image: string | ImageItem, index: number): string => {
  if (typeof image === 'string') {
    return `圖片 ${index + 1}`;
  }
  return image.alt || `圖片 ${index + 1}`;
};

const getImageSrc = (image: string | ImageItem): string => {
  return typeof image === 'string' ? image : image.url;
};

const getThumbnailSrc = (image: string | ImageItem): string => {
  if (typeof image === 'string') {
    return image;
  }
  return image.thumbnail || image.url;
};

// Lightbox Methods
const openLightbox = (index: number) => {
  currentImageIndex.value = index;
  lightboxOpen.value = true;
  lightboxLoading.value = true;
  document.body.style.overflow = "hidden";
  emit('lightbox-opened', index);
  
  // Simulate loading time for better UX
  setTimeout(() => {
    lightboxLoading.value = false;
  }, 300);
};

const closeLightbox = () => {
  lightboxOpen.value = false;
  lightboxLoading.value = false;
  document.body.style.overflow = "";
  emit('lightbox-closed');
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < props.images.length - 1) {
    currentImageIndex.value++;
  }
};

const viewImage = (index: number) => {
  openLightbox(index);
  emit("image-clicked", index);
};

const editImage = (index: number) => {
  editingImageIndex.value = index;
  const img = props.images[index];

  if (typeof img === "string") {
    editingImage.value = {
      url: img,
      caption: "",
      alt: "",
    };
  } else {
    editingImage.value = { ...img };
  }

  editModalOpen.value = true;
};

const closeEditModal = () => {
  editModalOpen.value = false;
  editingImageIndex.value = -1;
  editingImage.value = {
    url: "",
    caption: "",
    alt: "",
  };
};

const saveImageEdit = () => {
  if (editingImageIndex.value >= 0) {
    emit("image-updated", editingImageIndex.value, { ...editingImage.value });
  }
  closeEditModal();
};

const deleteImage = (index: number) => {
  if (confirm("確定要刪除這張圖片嗎？")) {
    emit("image-deleted", index);
  }
};

const downloadImage = async () => {
  if (!currentImage.value) return;

  try {
    const response = await fetch(currentImage.value.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `image-${currentImageIndex.value + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("下載圖片失敗:", err);
  }
};

const copyImageUrl = async () => {
  if (!currentImage.value) return;

  try {
    await navigator.clipboard.writeText(currentImage.value.url);
    // You might want to show a toast notification here
    console.log("圖片連結已複製到剪貼簿");
  } catch (err) {
    console.error("複製失敗:", err);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const index = parseInt(img.dataset.index || '0');
  imageErrors[index] = true;
  imageLoaded[index] = false;
  emit('image-error', index);
  
  // Create optimized placeholder SVG
  const placeholderSvg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="圖片載入失敗">
      <rect width="100%" height="100%" fill="var(--color-bg-tertiary, #f5f5f5)"/>
      <g fill="var(--color-text-muted, #999)" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">
        <text x="50%" y="45%" font-size="14">圖片載入失敗</text>
        <text x="50%" y="60%" font-size="12">點擊重試</text>
      </g>
    </svg>
  `;
  
  img.src = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
  img.style.cursor = 'pointer';
  img.onclick = () => {
    // Retry loading original image
    const originalSrc = typeof props.images[index] === 'string' 
      ? props.images[index] as string
      : (props.images[index] as ImageItem).url;
    img.src = originalSrc;
    img.onclick = null;
    img.style.cursor = '';
  };
};

// Enhanced download method for gallery items
const downloadImageFromGallery = async (index: number) => {
  const image = props.images[index];
  const url = getImageSrc(image);
  await downloadImageFromUrl(url, `image-${index + 1}`);
};

// Enhanced download method
const downloadImageFromUrl = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filename}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error("下載圖片失敗:", err);
  }
};

// Share functionality
const shareImage = async () => {
  if (!currentImage.value) return;

  const shareData = {
    title: '分享圖片',
    text: currentImage.value.caption || '查看這張圖片',
    url: currentImage.value.url
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(currentImage.value.url);
      console.log("圖片連結已複製到剪貼簿");
    }
  } catch (err) {
    console.error("分享失敗:", err);
  }
};

// Image loading handler
const handleImageLoad = (event: Event, index: number) => {
  imageLoaded[index] = true;
  emit('image-loaded', index);
};

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return;

  switch (event.key) {
    case "Escape":
      closeLightbox();
      break;
    case "ArrowLeft":
      previousImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "Home":
      currentImageIndex.value = 0;
      break;
    case "End":
      currentImageIndex.value = props.images.length - 1;
      break;
  }
};

// Intersection Observer for advanced lazy loading
const setupIntersectionObserver = () => {
  if (!window.IntersectionObserver) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;
          if (dataSrc && img.src !== dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px', // Load images 50px before they come into view
      threshold: 0.1
    }
  );
  
  return observer;
};

// Performance: Debounce image load handler
const debounceImageLoad = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedImageLoad = debounceImageLoad(handleImageLoad, 100);

// Lifecycle management
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  
  // Initialize loading states
  props.images.forEach((_, index) => {
    imageLoaded[index] = false;
    imageErrors[index] = false;
  });
  
  // Setup intersection observer for better performance
  if (props.loadingStrategy === 'lazy') {
    setupIntersectionObserver();
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  // Cleanup body overflow in case component unmounts while lightbox is open
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* === Media Gallery BEM Styles === */
.media-gallery {
  --gallery-columns: 3;
  --gallery-gap: var(--spacing-lg);
  --gallery-item-radius: var(--radius-lg);
  width: 100%;
}

/* === Empty State === */
.media-gallery__empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  text-align: center;
  background-color: var(--color-bg-secondary);
  border: 2px dashed var(--color-border-secondary);
  border-radius: var(--radius-xl);
  min-height: 300px;
}

.media-gallery__empty-icon {
  margin-bottom: var(--spacing-lg);
}

.media-gallery__empty-icon i {
  font-size: 4rem;
  color: var(--color-text-muted);
}

.media-gallery__empty-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

.media-gallery__empty-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
  line-height: var(--line-height-relaxed);
}

/* === Gallery Grid === */
.media-gallery__grid {
  display: grid;
  grid-template-columns: repeat(var(--gallery-columns), 1fr);
  gap: var(--gallery-gap);
}

.media-gallery--cols-2 {
  --gallery-columns: 2;
}

.media-gallery--cols-3 {
  --gallery-columns: 3;
}

.media-gallery--cols-4 {
  --gallery-columns: 4;
}

.media-gallery--cols-5 {
  --gallery-columns: 5;
}

/* === Grid Variants === */
.media-gallery--grid .media-gallery__grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.media-gallery--masonry .media-gallery__grid {
  columns: var(--gallery-columns);
  column-gap: var(--gallery-gap);
}

.media-gallery--masonry .media-gallery__item {
  break-inside: avoid;
  margin-bottom: var(--gallery-gap);
}

.media-gallery--minimal .media-gallery__grid {
  gap: var(--spacing-sm);
}

.media-gallery--minimal .media-gallery__item-container {
  border-radius: var(--radius-sm);
}

/* === Gallery Item === */
.media-gallery__item {
  position: relative;
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--gallery-item-radius);
  overflow: hidden;
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}

.media-gallery__item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.media-gallery__item:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

.media-gallery__item-container {
  position: relative;
  width: 100%;
}

/* === Image Wrapper === */
.media-gallery__image-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 default aspect ratio */
  overflow: hidden;
  border-radius: var(--gallery-item-radius);
}

.media-gallery--square .media-gallery__image-wrapper {
  padding-bottom: 100%; /* 1:1 aspect ratio */
}

.media-gallery--portrait .media-gallery__image-wrapper {
  padding-bottom: 133.33%; /* 3:4 aspect ratio */
}

.media-gallery--landscape .media-gallery__image-wrapper {
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.media-gallery--auto .media-gallery__image-wrapper {
  padding-bottom: auto;
  height: auto;
  min-height: 200px;
}

.media-gallery__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-base);
  border-radius: var(--gallery-item-radius);
}

.media-gallery__item:hover .media-gallery__image {
  transform: scale(1.05);
}

/* === Loading State === */
.media-gallery__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  z-index: 2;
}

.media-gallery__loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-secondary);
  border-top: 3px solid var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

/* === Overlay and Actions === */
.media-gallery__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  border-radius: var(--gallery-item-radius);
  opacity: 0;
  transition: opacity var(--transition-base);
  z-index: 3;
}

.media-gallery__item:hover .media-gallery__overlay,
.media-gallery__overlay--visible {
  opacity: 1;
}

.media-gallery__overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--spacing-md);
}

.media-gallery__actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  align-items: center;
}

.media-gallery__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.media-gallery__action-btn:hover {
  background-color: var(--color-bg-card);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.media-gallery__action-btn--edit:hover {
  background-color: var(--color-info);
  color: var(--color-text-light);
}

.media-gallery__action-btn--view:hover {
  background-color: var(--color-primary);
  color: var(--color-text-light);
}

.media-gallery__action-btn--download:hover {
  background-color: var(--color-success);
  color: var(--color-text-light);
}

.media-gallery__action-btn--delete:hover {
  background-color: var(--color-error);
  color: var(--color-text-light);
}

.media-gallery__info {
  align-self: flex-end;
  text-align: right;
}

.media-gallery__index {
  color: var(--color-text-light);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background-color: rgba(0, 0, 0, 0.7);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
}

/* === Caption === */
.media-gallery__caption {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: 0 0 var(--gallery-item-radius) var(--gallery-item-radius);
}

.media-gallery__caption-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* === Lightbox Styles === */
.media-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-lightbox__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(8px);
}

.media-lightbox__content {
  position: relative;
  z-index: 2;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.media-lightbox__close {
  position: absolute;
  top: -60px;
  right: -60px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-light);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-base);
  z-index: 10;
}

.media-lightbox__close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.media-lightbox__image-container {
  position: relative;
  max-width: 85vw;
  max-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-lightbox__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.media-lightbox__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-lightbox__loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--color-text-light);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

.media-lightbox__navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.media-lightbox__nav-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-light);
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-base);
}

.media-lightbox__nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.media-lightbox__nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.media-lightbox__counter {
  min-width: 120px;
  text-align: center;
}

.media-lightbox__counter-text {
  color: var(--color-text-light);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  background: rgba(0, 0, 0, 0.5);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
}

.media-lightbox__caption {
  max-width: 600px;
  text-align: center;
}

.media-lightbox__caption-text {
  color: var(--color-text-light);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  background: rgba(0, 0, 0, 0.7);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin: 0;
}

.media-lightbox__actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

.media-lightbox__action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: var(--color-text-light);
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.media-lightbox__action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: var(--color-text-light);
  text-decoration: none;
}

.media-lightbox__action-text {
  /* Styling handled by parent */
}

/* === Edit Modal Styles === */
.media-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-edit-modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.media-edit-modal__dialog {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.media-edit-modal__content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.media-edit-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: var(--color-text-light);
}

.media-edit-modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.media-edit-modal__close {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: var(--font-size-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.media-edit-modal__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.media-edit-modal__body {
  padding: var(--spacing-xl);
}

.media-edit-modal__form {
  /* Container for form fields */
}

.media-edit-modal__field {
  margin-bottom: var(--spacing-lg);
}

.media-edit-modal__label {
  display: block;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.media-edit-modal__required {
  color: var(--color-error);
}

.media-edit-modal__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.media-edit-modal__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-shadow-focus);
}

.media-edit-modal__input--readonly {
  background-color: var(--color-bg-tertiary);
  cursor: not-allowed;
}

.media-edit-modal__help-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
  display: block;
}

.media-edit-modal__footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-secondary);
  background-color: var(--color-bg-secondary);
}

.media-edit-modal__actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.media-edit-modal__btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.media-edit-modal__btn--secondary {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.media-edit-modal__btn--secondary:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-focus);
}

.media-edit-modal__btn--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-light);
}

.media-edit-modal__btn--primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* === Animations === */
@keyframes spin {
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
}

/* === Responsive Design === */
@media (max-width: 1200px) {
  .media-gallery--cols-5 {
    --gallery-columns: 4;
  }
}

@media (max-width: 992px) {
  .media-gallery--cols-4 {
    --gallery-columns: 3;
  }
  
  .media-gallery--cols-5 {
    --gallery-columns: 3;
  }
}

@media (max-width: 768px) {
  .media-gallery {
    --gallery-gap: var(--spacing-md);
  }
  
  .media-gallery--cols-3,
  .media-gallery--cols-4,
  .media-gallery--cols-5 {
    --gallery-columns: 2;
  }
  
  .media-gallery__empty-state {
    padding: var(--spacing-xl);
    min-height: 200px;
  }
  
  .media-gallery__actions {
    gap: var(--spacing-xs);
  }
  
  .media-gallery__action-btn {
    width: 36px;
    height: 36px;
    font-size: var(--font-size-sm);
  }
  
  /* Lightbox mobile adjustments */
  .media-lightbox__close {
    top: -50px;
    right: -50px;
    width: 44px;
    height: 44px;
  }
  
  .media-lightbox__nav-btn {
    width: 44px;
    height: 44px;
  }
  
  .media-lightbox__actions {
    gap: var(--spacing-sm);
  }
  
  .media-lightbox__action-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  
  /* Edit modal mobile */
  .media-edit-modal__dialog {
    width: 95%;
    margin: var(--spacing-lg);
  }
  
  .media-edit-modal__header,
  .media-edit-modal__body,
  .media-edit-modal__footer {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

@media (max-width: 576px) {
  .media-gallery {
    --gallery-columns: 1;
  }
  
  .media-gallery--masonry .media-gallery__grid {
    columns: 1;
  }
  
  .media-lightbox__close {
    top: 10px;
    right: 10px;
    position: fixed;
  }
  
  .media-lightbox__content {
    padding: 0 var(--spacing-lg);
  }
  
  .media-lightbox__actions {
    flex-direction: column;
    width: 100%;
  }
  
  .media-lightbox__action-btn {
    justify-content: center;
  }
}

/* === Dark Mode Support === */
[data-theme="dark"] .media-gallery__empty-state {
  background-color: var(--color-bg-primary);
  border-color: var(--color-border-primary);
}

[data-theme="dark"] .media-gallery__item {
  background-color: var(--color-bg-primary);
}

[data-theme="dark"] .media-gallery__caption {
  background-color: var(--color-bg-primary);
}

[data-theme="dark"] .media-edit-modal__content {
  background: var(--color-bg-primary);
}

[data-theme="dark"] .media-edit-modal__footer {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-primary);
}

/* === Accessibility === */
@media (prefers-reduced-motion: reduce) {
  .media-gallery__item,
  .media-gallery__image,
  .media-gallery__overlay,
  .media-gallery__action-btn,
  .media-lightbox__close,
  .media-lightbox__nav-btn,
  .media-lightbox__action-btn,
  .media-edit-modal__btn,
  .media-gallery__loading-spinner,
  .media-lightbox__loading-spinner {
    transition: none;
    animation: none;
  }
  
  .media-gallery__item:hover,
  .media-gallery__action-btn:hover,
  .media-lightbox__close:hover,
  .media-lightbox__nav-btn:hover {
    transform: none;
  }
  
  .media-gallery__item:hover .media-gallery__image {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .media-gallery__action-btn,
  .media-lightbox__close,
  .media-lightbox__nav-btn,
  .media-lightbox__action-btn,
  .media-edit-modal__btn {
    border-width: 2px;
  }
  
  .media-gallery__item {
    border: 2px solid var(--color-border-primary);
  }
}

/* === Focus Management === */
.media-gallery__item:focus-visible,
.media-gallery__action-btn:focus-visible,
.media-lightbox__close:focus-visible,
.media-lightbox__nav-btn:focus-visible,
.media-lightbox__action-btn:focus-visible,
.media-edit-modal__close:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
</style>