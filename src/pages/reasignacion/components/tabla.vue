<template>
  <VDataTable
    :headers="headers"
    :items="items"
    density="compact"
    :items-per-page="5"
    class="text-no-wrap"
  />
</template>



<script setup>
import { currentUser, initUser, logout as doLogout } from '@/composables/useAuth'
import { $api } from '@/utils/api'
import { ref } from 'vue';
import dayjs from "dayjs"
const emit = defineEmits(['notify']);

const name = computed(() => currentUser.value?.nombre || currentUser.value?.username || 'Usuario')
const error_exit = ref(false)
const items = ref([]);
const headers = [
  { title: "cod_proyecto", key: "cod_proyecto",},
  { title: "line_id", key: "line_id",},
  { title: "cto_inicial", key: "cto_inicial", },
  { title: "cto_nuevo", key: "cto_nuevo", },
  { title: "fecha_ingreso", key: "fecha_ingreso", },
  { title: "fecha_cierre", key: "fecha_cierre", },
  { title: "tipo", key: "tipo", },
  { title: "tiempo", key: "tiempo", },
];

const notify = (type, text) => {
  emit('notify', { type, text })
}


// llamada a la api para obetenr los registros por operador
const consultoperador = async () => {
  try {
    const res = await $api(`reasignacion/buscar-reasginacion-operador/mes-actual/${name.value}`,{
      method: 'GET',
      onResponseError({response}){
        notify('warning', 'El usuario no tiene instalaciones');
      }
    });

    items.value = res.rows.map(u => ({
      cod_proyecto: u.cod_proyecto,
      line_id: u.line_id,
      cto_inicial: u.cto_inicial,
      cto_nuevo: u.cto_nuevo,
      fecha_ingreso: dayjs(u.fecha_ingreso).format("DD/MM/YYYY HH:mm:ss"),
      fecha_cierre: dayjs(u.fecha_cierre).format("DD/MM/YYYY HH:mm:ss"),
      tipo: u.tipo,
      tiempo: u.tiempo,
    }));
    notify('success', 'El usuario tiene instalaciones');
  } catch (error) {
  } finally {
  }
};
onMounted(consultoperador);
</script>