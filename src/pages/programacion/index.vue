<template>
    <VRow>
        <VCol>
            <VBtn 
                color="primary" 
                density="compact"
                @click="openDialog">
                Generar Programacion
            </VBtn>
        </VCol>
    </VRow>
    <tabla v-model:apiResp="lastApiResponse" :loading="loading" />

    <ModalGenerar 
        v-model:isDialogVisible="isDialogOpen" 
        @submit="handleSubmit" 
    />
</template>

<script setup>
import { VBtn, VCol } from 'vuetify/components';
import { ref } from 'vue';
import ModalGenerar from '@/pages/programacion/components/modal_generar.vue';
import tabla from '@/pages/programacion/components/tablaprogramacion.vue';
import { useProgramacion } from '@/pages/programacion/composables/useProgramacion.js';

const isDialogOpen = ref(false) // variable para abrir el modal

const openDialog = () => { // funcion que cambia de estado a la variable se usara con el evento click en el boton
    isDialogOpen.value = true
}


// 👇 CREA UNA SOLA INSTANCIA Y PROVÉELA A LOS HIJOS
const programacion = useProgramacion()
provide('programacion', programacion)

// Puedes destripar lo que necesites para este componente
const { lastApiResponse, loading, error } = programacion

const handleSubmit = (data) => {
    console.log('✅ Datos recibidos del modal:', data)
    // aquí podrías hacer un fetch/axios o guardar en tu store
}


definePage({
    meta: {
        roles: ['administrador'],   // 👈 solo este rol puede entrar
    },
})

</script>