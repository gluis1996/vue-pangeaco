import { $api } from '@/utils/api'
import { initUser, hasRole } from '@/composables/useAuth'

export const setupGuards = router => {
  router.beforeEach(async to => {
    // Rutas públicas
    if (to.meta.public) return

    // Solo para NO autenticados (login/register)
    if (to.meta.unauthenticatedOnly) {
      try {
        await $api('/auth/me', { ignoreAuthRedirect: true })
        // ya autenticado → al dashboard
        return { name: 'dashboard' }
      } catch {
        // no autenticado → permite entrar
        return
      }
    }

    // Rutas protegidas: exige sesión
    try {
      await $api('/auth/me', { ignoreAuthRedirect: true })
      await initUser() // asegura user (con role) en memoria
    } catch {
      return {
        name: 'login',
        query: { to: to.fullPath !== '/' ? to.fullPath : undefined },
      }
    }

    // 👇 chequeo de roles
    if (to.meta.roles && !hasRole(to.meta.roles)) {
      return { name: 'not-authorized' }   // en vez de path:'/403'
    }

    return
  })
}
