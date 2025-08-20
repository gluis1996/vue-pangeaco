import { ref, computed } from 'vue'
import { $api } from '@/utils/api'

const _user = ref(JSON.parse(localStorage.getItem('app:user') || 'null')) // UI-only cache
const _loaded = ref(false)

export const currentUser = computed(() => _user.value)
export const isAuth = computed(() => !!_user.value)
export const role = computed(() => _user.value?.role || null)

export function hasRole(roles) {
  const r = role.value
  if (!roles) return true
  if (Array.isArray(roles)) return roles.includes(r)
  return r === roles
}

export async function initUser() {
  if (_loaded.value) return
  try {
    if (!_user.value) {
      const { user } = await $api('/auth/me', { ignoreAuthRedirect: true })
      _user.value = user
      localStorage.setItem('app:user', JSON.stringify(user)) // UI-only
    }
  } catch {
    _user.value = null
    localStorage.removeItem('app:user')
  } finally {
    _loaded.value = true
  }
}

export function setUser(user) {
  _user.value = user
  localStorage.setItem('app:user', JSON.stringify(user))
}

export async function logout() {
  try { await $api('/auth/logout', { method: 'POST' }) } catch {}
  _user.value = null
  localStorage.removeItem('app:user')
  window.location.href = '/login'
}
