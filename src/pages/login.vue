<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { $api } from '@/utils/api'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
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
    console.log(res);
    
    // ⬇️ Guarda el usuario para toda la app (username, email, role, nombre, etc.)
    // Backend debe devolver: { user: { id, username, nombre, email, role } }
    setUser(res.user)

    success_exis.value = 1

    await nextTick(() => {
      const dest = route.query.to ? String(route.query.to) : { name: 'dashboard' }
      router.replace(dest)
    })
  } catch (err) {
    // console.error(err)
    error_exis.value = 'Credenciales incorrectas'
    alert('Credenciales incorrectas')
  }
}

</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-5 pa-lg-7">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Inicie Sesion
          </h4>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="login">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField v-model="form.username" autofocus label="username" type="username" />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField v-model="form.password" label="Password" placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                <br>

                <!-- login button -->
                <VBtn block type="submit">
                  Login
                </VBtn>
              </VCol>
              
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
