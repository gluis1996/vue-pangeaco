import { createFetch } from '@vueuse/core'
import { destr } from 'destr'

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  fetchOptions: {
    credentials: 'include',                // <- ENVÍA COOKIES
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = localStorage.getItem('token') ?? sessionStorage.getItem('token')//useCookie('accessToken').value
      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        }
      }
      
      return { options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      // Parse data if it's JSON
      let parsedData = null
      try {
        parsedData = destr(data)
      }
      catch (error) {
        // Solo logear errores críticos, no errores de parsing menores
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error parsing response data:', error)
        }
      }
      
      return { data: parsedData, response }
    },
  },
})
