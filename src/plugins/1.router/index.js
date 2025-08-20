// src/plugins/1.router/index.js
import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupGuards } from './guards'
// 👇 ojo: ya no usamos $api aquí, así que no lo importes

function recursiveLayouts(route) {
  if (route.children) {
    for (let i = 0; i < route.children.length; i++)
      route.children[i] = recursiveLayouts(route.children[i])
    return route
  }
  return setupLayouts([route])[0]
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
    return { top: 0 }
  },
  extendRoutes: pages => [
  { path: '/', name: 'index', redirect: { name: 'dashboard' } },
  ...pages.map(route => recursiveLayouts(route)),
],

})

setupGuards(router)
export { router }
export default function (app) {
  app.use(router)
}
