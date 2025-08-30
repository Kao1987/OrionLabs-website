<template>
  <transition name="fade">
    <div
      v-if="show"
      class="cookie-banner position-fixed bottom-0 start-0 w-100 bg-dark text-light p-3 shadow-lg"
      style="z-index: 2000"
    >
      <div
        class="cookie-banner__container container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2"
      >
        <div class="cookie-banner__text mb-2 mb-md-0">
          本網站使用 Cookie 以提升瀏覽體驗。若您位於歐洲經濟區 (EEA)
          或英國，請點選「同意」以繼續使用本網站。
          <RouterLink to="/cookie" class="cookie-banner__link ms-2 text-info">Cookie 使用聲明</RouterLink>
        </div>
        <button class="cookie-banner__accept-btn btn btn-primary btn-sm px-4" @click="accept">同意</button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const show = ref(false);

function isEEAOrUK() {
  // 簡易判斷，實務可用第三方服務或更完整的 IP/地區偵測
  const lang = navigator.language || navigator.languages[0] || "";
  return (
    /^(en|de|fr|it|es|nl|pl|sv|fi|da|no|pt|el|hu|cs|sk|sl|et|lv|lt|bg|ro|hr|ga|mt|is|tr|ru|uk|cy|eu|ca|gl|sq|mk|sr|bs|me|is|fo|lb|li|ee|uk)/i.test(
      lang,
    ) ||
    /-GB$|-IE$|-DE$|-FR$|-IT$|-ES$|-NL$|-PL$|-SE$|-FI$|-DK$|-NO$|-PT$|-EL$|-HU$|-CS$|-SK$|-SL$|-ET$|-LV$|-LT$|-BG$|-RO$|-HR$|-GA$|-MT$|-IS$|-TR$|-RU$|-UA$|-CY$|-EU$|-CA$|-GL$|-SQ$|-MK$|-SR$|-BS$|-ME$|-IS$|-FO$|-LB$|-LI$|-EE$|-UK$/i.test(
      lang,
    )
  );
}

onMounted(() => {
  if (localStorage.getItem("cookieAccepted") !== "yes" && isEEAOrUK()) {
    show.value = true;
  }
});

function accept() {
  localStorage.setItem("cookieAccepted", "yes");
  show.value = false;
}
</script>

<style scoped>
.cookie-banner {
  animation: slide-up 0.4s;
}
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
