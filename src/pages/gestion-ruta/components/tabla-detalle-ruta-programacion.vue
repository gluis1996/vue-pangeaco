<template>
    <VDataTable
        :headers="headers"
        :items="items"      
        density="compact"
        :items-per-page="20"
        class="text-no-wrap"
    />
</template>

<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs'

const props = defineProps(['listaapiRutas'])

// helpers cortitos
const d  = iso => (iso ? dayjs(iso).format('DD/MM/YYYY') : '')
const dt = iso => (iso ? dayjs(iso).format('DD/MM/YYYY HH:mm') : '')

const headers = [
  { title: "nombre ruta",       key: "nombre_ruta" },
  { title: "fecha programada",  key: "fecha_programada" },
  { title: "fecha inicio",      key: "fecha_inicio" },
  { title: "fecha_fin",         key: "fecha_fin" },
  { title: "cant progr",        key: "cant_programada" },
  { title: "cant progr",        key: "cant_trabajados" },
  { title: "pendiente",         key: "pendiente" },
  { title: "observacion",       key: "observacion" },
  { title: "departamento",      key: "departamento" },
  { title: "sitio",             key: "sitio" },
];

const items = computed(()=>{
    console.log(props.listaapiRutas);    
    return (props.listaapiRutas ?? []).map(r => ({
        nombre_ruta : r.nombre_ruta,
        fecha_programada: d(r.fecha_programada),
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        cant_programada: r.cant_programada,
        cant_trabajados: r.cant_trabajados,
        pendiente: r.pendiente,
        observacion: r.observacion,
        departamento: r.departamento,
        sitio: r.sitio
    }));
})


</script>