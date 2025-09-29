import { $api } from '@/utils/api'
import { initUser, hasRole } from '@/composables/useAuth'

export const setupGuards = router => {
  let isAuthChecking = false // Prevenir múltiples llamadas simultáneas
  
  router.beforeEach(async to => {
    // Prevenir navegaciones múltiples rápidas
    if (isAuthChecking) {
      console.warn('Navegación bloqueada: verificación de autenticación en progreso')
      return false
    }

    // Rutas públicas
    if (to.meta.public) return

    // Solo para NO autenticados (login/register)
    if (to.meta.unauthenticatedOnly) {
      isAuthChecking = true
      try {
        await $api('/auth/me', { ignoreAuthRedirect: true })
        // ya autenticado → al dashboard
        return { name: 'dashboard' }
      } catch {
        // no autenticado → permite entrar
        return
      } finally {
        isAuthChecking = false
      }
    }

    // Rutas protegidas: exige sesión
    isAuthChecking = true
    try {
      await $api('/auth/me', { ignoreAuthRedirect: true })
      await initUser() // asegura user (con role) en memoria
    } catch {
      return {
        name: 'login',
        query: { to: to.fullPath !== '/' ? to.fullPath : undefined },
      }
    } finally {
      isAuthChecking = false
    }

    // 👇 chequeo de roles
    if (to.meta.roles && !hasRole(to.meta.roles)) {
      console.warn('Acceso denegado: usuario sin permisos para', to.name)
      return { name: 'not-authorized' }   // en vez de path:'/403'
    }

    return
  })
}
