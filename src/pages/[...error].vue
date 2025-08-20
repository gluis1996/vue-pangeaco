<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import pages404 from '@images/pages/404.png'
import miscMaskDark from '@images/misc/misc-mask-dark.png'
import miscMaskLight from '@images/misc/misc-mask-light.png'
import miscObj from '@images/pages/misc-404-object.png'

const route = useRoute()
const authThemeMask = useGenerateImageVariant(miscMaskLight, miscMaskDark)

definePage({ meta: { public: true } })

const code = computed(() => route.query.code ?? '404')
const title = computed(() => route.query.title ?? 'Page Not Found ⚠️')
const description = computed(
  () => route.query.description ?? "We couldn't find the page you are looking for."
)
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      :status-code="code"
      :title="title"
      :description="description"
      class="mb-10"
    />

    <!-- 👉 Image -->
    <div class="misc-avatar w-100 text-center">
      <VImg
        :src="pages404"
        alt="Coming Soon"
        :height="$vuetify.display.xs ? 400 : 500"
        class="my-sm-5"
      />

      <VBtn
        to="/"
        class="mt-10"
      >
        Back to Home
      </VBtn>

      <VImg
        :src="authThemeMask"
        class="d-none d-md-block footer-coming-soon flip-in-rtl"
        cover
      />

      <VImg
        :src="miscObj"
        class="d-none d-md-block footer-coming-soon-obj"
        :max-width="177"
        height="160"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>
