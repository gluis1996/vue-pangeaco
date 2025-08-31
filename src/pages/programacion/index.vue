<template>
    <VRow>
        <VCol>
            <VBtn color="primary" @click="openDialog">
                Generar Programacion
            </VBtn>
        </VCol>
    </VRow>
    <ModalGenerar 
        v-model:isDialogVisible="isDialogOpen" 
        @submit="handleSubmit" 
    />
</template>

<script setup>
import { VCol } from 'vuetify/components';
import { ref } from 'vue';
import ModalGenerar from '@/pages/programacion/components/modal_generar.vue';

const isDialogOpen = ref(false) // variable para abrir el modal


const openDialog = () => { // funcion que cambia de estado a la variable se usara con el evento click en el boton
    isDialogOpen.value = true
}

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