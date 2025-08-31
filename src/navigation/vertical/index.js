export default [
  {
    title: 'Home',
    to: { name: 'dashboard' },
    icon: { icon: 'ri-home-smile-2-line' },
  },
  {
    title: 'Preasignacion',
    to: { name: 'preasignacion' },
    icon: { icon: 'ri-file-text-line' },
    roles: ['operador'],
  },
  {
    title: 'Reasignacion',
    to: { name: 'reasignacion' },
    icon: { icon: 'ri-file-text-line' },
    roles: ['administrador'], 
  },
  {
    title: 'Programacion',
    to: { name: 'programacion' },
    icon: { icon: 'ri-file-text-line' },
    roles: ['administrador'], 
  },
]
