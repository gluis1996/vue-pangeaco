<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import avatar1 from '@images/avatars/avatar-1.png'

// 👇 importa el estado global del usuario y helpers
import { currentUser, initUser, logout as doLogout } from '@/composables/useAuth'
import { onMounted, computed } from 'vue'

// Asegúrate de tener el user cargado si recargaron la pestaña
onMounted(() => { initUser() })

// Lo que vas a mostrar
const name = computed(() => currentUser.value?.nombre || currentUser.value?.username || 'Usuario')
const role = computed(() => currentUser.value?.role || '')
const email = computed(() => currentUser.value?.email || '')

const router = useRouter();

const logout = async()=>{
  try {
    await $api('/auth/logout', { method: 'POST' }) // 1) borra cookie en backend
  } catch (e) {
    // si falla, igual seguimos con limpieza local
    console.error('logout error:', e)
  } finally {
    // 2) limpiar residuos por si quedó algo viejo
    //localStorage.removeItem('token'); localStorage.removeItem('user')
    //sessionStorage.removeItem('token'); sessionStorage.removeItem('user')

    // 3) redirigir
    router.push('/login')
  }
}

</script>

<template>
  <VBadge
    dot
    bordered
    location="bottom right"
    offset-x="2"
    offset-y="2"
    color="success"
    class="user-profile-badge"
  >
    <VAvatar
      class="cursor-pointer"
      size="38"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="15px"
      >
        <VList>
          <VListItem class="px-4">
            <div class="d-flex gap-x-2 align-center">
              <VAvatar>
                <VImg :src="avatar1" />
              </VAvatar>

              <div>
                <div class="text-body-2 font-weight-medium text-high-emphasis">
                  {{ name }}
                </div>
                <div class="text-capitalize text-caption text-disabled">
                  {{ email }}
                </div>
              </div>
            </div>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            

            <VListItem class="px-4">
              <VBtn
                block
                color="error"
                size="small"
                append-icon="ri-logout-box-r-line"
                @click="logout"
              >
                Logout
              </VBtn>
            </VListItem>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>

<style lang="scss">
.user-profile-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
