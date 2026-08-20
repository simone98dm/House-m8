<script setup lang="ts">
// Size justification (Phase 7, "no component over ~250 lines without one"):
// ~317 lines implementing ONE widget whose parts cannot be separated without
// sharing state across the seam — slide index, autoplay timer, thumbnail strip,
// keyboard navigation and touch/swipe handling all read and write the same
// `currentIndex`. Splitting would replace local state with prop/emit plumbing
// between components that are never used independently. Left whole deliberately.
interface Props {
  images: string[];
  autoplay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
}

const {
  images,
  autoplay = false,
  interval = 5000,
  showThumbnails = true,
} = defineProps<Props>();

const currentIndex = ref(0);
const isTransitioning = ref(false);
const isFullscreen = ref(false);
let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const goToSlide = (index: number) => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);

  resetAutoplay();
};

const nextSlide = () => {
  const next = (currentIndex.value + 1) % images.length;
  goToSlide(next);
};

const prevSlide = () => {
  const prev = (currentIndex.value - 1 + images.length) % images.length;
  goToSlide(prev);
};

const startAutoplay = () => {
  if (!autoplay || images.length <= 1) return;
  autoplayTimer = setInterval(() => {
    nextSlide();
  }, interval);
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
};

const resetAutoplay = () => {
  stopAutoplay();
  startAutoplay();
};

const openFullscreen = () => {
  isFullscreen.value = true;
  document.body.style.overflow = 'hidden';
};

const closeFullscreen = () => {
  isFullscreen.value = false;
  document.body.style.overflow = '';
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!isFullscreen.value) return;

  if (event.key === 'Escape') {
    closeFullscreen();
  } else if (event.key === 'ArrowLeft') {
    prevSlide();
  } else if (event.key === 'ArrowRight') {
    nextSlide();
  }
};

onMounted(() => {
  if (autoplay) {
    startAutoplay();
  }
  globalThis.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  stopAutoplay();
  globalThis.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

watch(
  () => autoplay,
  (newValue) => {
    if (newValue) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  },
);
</script>

<template>
  <div class="relative w-full">
    <div
      class="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
    >
      <TransitionGroup name="carousel" tag="div" class="relative h-full w-full">
        <div
          v-for="(image, index) in images"
          v-show="index === currentIndex"
          :key="image"
          class="absolute inset-0"
        >
          <NuxtImg
            :src="image"
            :alt="`Image ${index + 1}`"
            class="h-full w-full object-cover cursor-pointer"
            @click="openFullscreen"
          />
        </div>
      </TransitionGroup>

      <!-- Navigation Buttons. Raw: bespoke circular icon overlay (p-2,
           bg-white/80 backdrop-blur, absolutely positioned over the image) —
           not on UiButton's text-oriented size scale. -->
      <template v-if="images.length > 1">
        <button
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 flex"
          :aria-label="$t('a11y.carousel.previous')"
          @click="prevSlide"
        >
          <Icon
            name="heroicons:chevron-left"
            class="h-5 w-5 text-gray-900"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 flex"
          :aria-label="$t('a11y.carousel.next')"
          @click="nextSlide"
        >
          <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-900" />
        </button>
      </template>

      <div
        v-if="images.length > 1"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
      >
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <div
      v-if="showThumbnails && images.length > 1"
      class="mt-3 flex gap-2 overflow-x-auto pb-2"
    >
      <!-- Raw: this is an image thumbnail (h-16 w-16), not a text/icon
           button — UiButton has no image-content mode. -->
      <button
        v-for="(image, index) in images"
        :key="`thumb-${index}`"
        type="button"
        class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all"
        :class="
          index === currentIndex
            ? 'border-primary-500 ring-2 ring-primary-200'
            : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'
        "
        @click="goToSlide(index)"
      >
        <NuxtImg
          :src="image"
          :alt="`Thumbnail ${index + 1}`"
          class="h-full w-full object-cover"
        />
      </button>
    </div>

    <div
      v-if="!showThumbnails && images.length > 1"
      class="mt-3 flex justify-center gap-2"
    >
      <!-- Raw: a 2px indicator dot, far below UiButton's smallest size. -->
      <button
        v-for="(_, index) in images"
        :key="`dot-${index}`"
        type="button"
        class="h-2 w-2 rounded-full transition-all"
        :class="
          index === currentIndex
            ? 'bg-primary-500 w-6'
            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
        "
        @click="goToSlide(index)"
      />
    </div>

    <Teleport to="body">
      <Transition name="fullscreen">
        <div
          v-if="isFullscreen"
          class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          @click="closeFullscreen"
        >
          <!-- Close Button. Raw: same bespoke circular icon-overlay case as
               the nav buttons above. -->
          <button
            type="button"
            class="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            :aria-label="$t('a11y.close')"
            @click="closeFullscreen"
          >
            <Icon name="heroicons:x-mark" class="h-6 w-6" aria-hidden="true" />
          </button>

          <div
            class="flex h-full w-full items-center justify-center p-4"
            @click.stop
          >
            <TransitionGroup
              name="carousel"
              tag="div"
              class="relative h-full w-full flex items-center justify-center"
            >
              <NuxtImg
                v-for="(image, index) in images"
                v-show="index === currentIndex"
                :key="`fullscreen-${image}`"
                :src="image"
                :alt="`Image ${index + 1}`"
                class="max-h-full max-w-full object-contain"
              />
            </TransitionGroup>

            <!-- Navigation Buttons. Raw: same bespoke circular icon-overlay
                 case as the non-fullscreen nav buttons above. -->
            <template v-if="images.length > 1">
              <button
                type="button"
                class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                :aria-label="$t('a11y.carousel.previous')"
                @click.stop="prevSlide"
              >
                <Icon
                  name="heroicons:chevron-left"
                  class="h-8 w-8"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                :aria-label="$t('a11y.carousel.next')"
                @click.stop="nextSlide"
              >
                <Icon
                  name="heroicons:chevron-right"
                  class="h-8 w-8"
                  aria-hidden="true"
                />
              </button>
            </template>

            <div
              v-if="images.length > 1"
              class="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
            >
              {{ currentIndex + 1 }} / {{ images.length }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
  transition: opacity 0.3s ease;
}

.carousel-enter-from {
  opacity: 0;
}

.carousel-leave-to {
  opacity: 0;
}

.fullscreen-enter-active,
.fullscreen-leave-active {
  transition: opacity 0.3s ease;
}

.fullscreen-enter-from,
.fullscreen-leave-to {
  opacity: 0;
}
</style>
