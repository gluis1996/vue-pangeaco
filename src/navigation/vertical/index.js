import { icon } from "@/views/components/badge/demoCodeBadge";

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
    title: 'Progranaciones',
    icon: { icon: 'ri-file-text-line' },
    children: [
      {
        title: 'Generar Programacion',
        to: { name: 'programacion' },
      },
      {
        title: 'Ver Programaciones',
        to: { name: 'programacion-ver' },
      }
    ],
    roles: ['administrador'],
  },{
    title: 'Trabajos',
    icon: { icon: 'ri-file-text-line' },
    children: [
      {
        title: 'Gestion Ruta',
        to: { name: 'gestion-ruta' },
      },
      {
        title: 'Trabajo Timbrados',
        to: { name: 'trabajos-timbrados' },
        roles: ['operador','administrador'],
      },
      {
        title: 'Trabajo Inspecciones',
        to: { name: 'trabajos-inspecciones' },
      }
    ],
    roles: ['operador','administrador'],
  },
  {
    title: 'Intermodal',
    icon: { icon: 'ri-pin-distance-line' },
    children:[
      {
        title: 'Enlace Inter. B. I.',
        to: { name: 'intermodal-base-interna' },
        roles: ['agente','administrador'],
      },
      {
        title: 'Seguimiento FTTH',
        to: { name: 'seguimiento-ftth' },
         roles: ['administrador','tecnico','agente'],
      },
      {
        title: 'tramos',
        to: { name: 'tramos' },
         roles: ['administrador','agente'],
      }
    ]
  }
]
