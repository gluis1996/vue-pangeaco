<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { $api } from '@/utils/api'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { ref, nextTick } from 'vue'          // 👈 agrega nextTick
import { setUser } from '@/composables/useAuth' // 👈 importar setUser

const form = ref({
  username: '',
  password: '',
  remember: false,
})
const error_exis = ref(null)
const success_exis = ref(null)
const route = useRoute()
const router = useRouter()
definePage({ meta: { layout: 'blank',  unauthenticatedOnly: true} })

const isPasswordVisible = ref(false)
const authV2LoginMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2LoginIllustration = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)

const login = async ()=>{
   try {
    error_exis.value = null
    success_exis.value = null

    // ⬇️ CAPTURA la respuesta del login
    const res = await $api('/auth/login', {
      method: 'POST',
      body: {
        username: form.value.username?.trim(),
        password: form.value.password,
      },
    })

    // ⬇️ Guarda el usuario para toda la app (username, email, role, nombre, etc.)
    // Backend debe devolver: { user: { id, username, nombre, email, role } }
    setUser(res.user)

    success_exis.value = 1

    await nextTick(() => {
      const dest = route.query.to ? String(route.query.to) : { name: 'dashboard' }
      router.replace(dest)
    })
  } catch (err) {
    console.error(err)
    error_exis.value = 'Credenciales incorrectas'
  }
}

</script>

<template>
  <div class="login-page">
    <RouterLink to="/">
      <div class="app-logo auth-logo">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title">{{ themeConfig.app.title }}</h1>
      </div>
    </RouterLink>

    <VRow no-gutters class="auth-wrapper">
      <VCol md="8" class="d-none d-md-flex align-center justify-center position-relative">
        <div class="d-flex align-center justify-center pa-10">
          <img :src="authV2LoginIllustration" class="auth-illustration w-100" alt="auth-illustration" />
        </div>
        <VImg :src="authV2LoginMask" class="d-none d-md-flex auth-footer-mask" alt="auth-mask" />
      </VCol>

      <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center" style="background-color: rgb(var(--v-theme-surface));">
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-5 pa-lg-7">
          <VCardText>
            <h4 class="text-h4 mb-1">
              Welcome to <span class="text-capitalize">{{ themeConfig.app.title }}! 👋🏻</span>
            </h4>
            <p class="mb-0">Please sign-in to your account and start the adventure</p>
          </VCardText>

          <VCardText>
            <VForm @submit.prevent="login">
              <VRow>
                <VCol cols="12">
                  <VTextField v-model="form.username" autofocus label="Username" type="text" placeholder="username" />
                </VCol>

                <VCol cols="12">
                  <VTextField
                    v-model="form.password"
                    label="Password"
                    placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <VAlert type="error" closable v-if="error_exis">{{ error_exis }}</VAlert>
                  <VAlert type="success" closable v-if="success_exis">Inicio de sesión exitoso</VAlert>

                  <VBtn block type="submit">Login</VBtn>
                </VCol>

                <VCol cols="12" class="text-center">
                  <AuthProvider />
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
