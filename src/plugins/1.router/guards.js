// export const setupGuards = router => {
//   // 👉 router.beforeEach
//   // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
//   router.beforeEach(to => {
//     /*
//          * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
//          * Examples of public routes are, 404, under maintenance, etc.
//          */
//     if (to.meta.public)
//       return

//     const token =
//       localStorage.getItem('token') ?? sessionStorage.getItem('token')
//     const user =
//       localStorage.getItem('user') ?? sessionStorage.getItem('user')

//     // 3) Fuerza booleano
//     const isLoggedIn = !!(token && user)

//     console.log('isLoggedIn?', isLoggedIn, { token, user })

//     if (to.meta.unauthenticatedOnly) {
//       if (isLoggedIn)
//         return '/'
//       else
//         return undefined
//     }
//     if (!isLoggedIn && to.matched.length) {
//       /* eslint-disable indent */
//             return isLoggedIn
//                 ? { name: 'not-authorized' }
//                 : {
//                     name: 'login',
//                     query: {
//                         ...to.query,
//                         to: to.fullPath !== '/' ? to.path : undefined,
//                     },
//                 }
//             /* eslint-enable indent */
//     }
//   })
// }


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
