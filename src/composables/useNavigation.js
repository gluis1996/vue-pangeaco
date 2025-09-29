import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Composable para manejar navegación de forma segura
export function useNavigation() {
  const router = useRouter()
  const isNavigating = ref(false)
  const lastClickTime = ref(0)
  const clickDelay = 300 // ms para prevenir doble clic

  const safeNavigate = async (to, replace = false) => {
    const now = Date.now()
    
    // Prevenir doble clic rápido
    if (now - lastClickTime.value < clickDelay) {
      console.warn('Navegación ignorada: demasiado rápida')
      return false
    }
    
    // Prevenir navegación mientras otra está en progreso
    if (isNavigating.value) {
      console.warn('Navegación ignorada: navegación en progreso')
      return false
    }

    try {
      isNavigating.value = true
      lastClickTime.value = now
      
      if (replace) {
        await router.replace(to)
      } else {
        await router.push(to)
      }
      
      return true
    } catch (error) {
      console.error('Error en navegación:', error)
      return false
    } finally {
      // Pequeño delay para asegurar que la navegación se complete
      setTimeout(() => {
        isNavigating.value = false
      }, 100)
    }
  }

  return {
    safeNavigate,
    isNavigating: readonly(isNavigating)
  }
}