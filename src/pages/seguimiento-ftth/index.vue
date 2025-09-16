<template>
    <h2>Seguimiento Contrata</h2>

    <VRow>
        <VCol cols="12" md="10" lg="4" v-for="list in lista_asignacion">
            <card_seguimiento 
            :lista_seguimiento="list" 
            @cargar_detalle="listar_detalle"
            />
        </VCol>
    </VRow>


</template>

<script setup>

import { onMounted, ref } from 'vue';
import { currentUser, initUser, logout as doLogout } from '@/composables/useAuth'
import { $api } from '@/utils/api';
import card_seguimiento from '@/pages/seguimiento-ftth/components/card_seguimiento.vue'
import { VCol, VRow } from 'vuetify/components';


const name = computed(() => currentUser.value?.nombre || currentUser.value?.username || 'Usuario')
console.log(name.value.toUpperCase());
const lista_asignacion = ref([])

onMounted(listar_asignaciones);

async function listar_asignaciones() {
    try {
        const response = await $api(`internodal/listar-trabajos-asigandos/${name.value.toUpperCase()}`, {
            method: 'GET',
            onResponseError({ response }) {
                console.log(response);
            }
        })
        console.log(response);
        lista_asignacion.value = response.result;
        console.log(lista_asignacion.value);
    } catch (error) {
        console.log('Error cargando datos:', error)
    }
}

const listar_detalle = async (item) => {
    console.log(item);
}
</script>