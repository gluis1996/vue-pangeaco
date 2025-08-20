import { ofetch } from 'ofetch'

function isAuthMeReq(req) {
  const url = typeof req === 'string' ? req : (req?.url || '')
  return url.includes('/auth/me')
}

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'include',

  async onResponseError({ request, options, response }) {
    // Si no es 401 o ya reintentamos, no hacemos refresh
    if (response?.status !== 401 || options?._retry) {
      // Redirección global SOLO si:
      // - es 401
      // - NO está marcada para ignorar
      // - NO es /auth/me (el guard se encarga)
      if (
        response?.status === 401 &&
        !options?.ignoreAuthRedirect &&
        !isAuthMeReq(request)
      ) {
        const to = encodeURIComponent(window.location.pathname + window.location.search)
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?to=${to}&reason=expired`
        }
      }
      return
    }

    // Intentar refresh
    try {
      await ofetch('/auth/refresh', {
        baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
        credentials: 'include',
        method: 'POST',
        ignoreAuthRedirect: true, // que este 401 no redirija
      })

      // Marcar reintento para no entrar en bucle
      options._retry = true
      options.ignoreAuthRedirect = true

      // Reintentar la request original
      return await ofetch(request, options)
    } catch {
      // Refresh falló => login (si no es /auth/me y no está ignorado)
      if (
        !options?.ignoreAuthRedirect &&
        !isAuthMeReq(request) &&
        window.location.pathname !== '/login'
      ) {
        const to = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?to=${to}&reason=expired`
      }
    }
  },
})
