<template>
    <h5>
        estramos en la vista de seguiemiento licencias
    </h5>
    <!-- Loader Global para la página -->
    <VRow class="mb-4">
        <!-- Loader Global para la página -->
        <VOverlay v-model="isPageLoading" class="align-center justify-center" persistent>
            <VProgressCircular indeterminate color="primary" size="64" />
        </VOverlay>
    </VRow>

    <Tabla 
        :listaproyecto="listaprogramacion" 
        @licencia="abrirDialogoLicencia"
    />

    <DialogLicencia
        v-model:open="openLicencia"
        :id_proyecto="idSeleccionado"
        :data="lista_data"
        :items="licenciasDelProyecto"
        :isedit="licenciasDelProyecto.length > 0"
        :minimo="licenciasDelProyecto.length"
        @save = "crearLicencia"
        @cancel="openLicencia = false"
    />

    <!-- Snackbar para notificaciones -->
    <VSnackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
        location="top right"
    >
        {{ snackbar.message }}
    </VSnackbar>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Tabla from '@/pages/seguimiento-licencia/components/tabla.vue'
import DialogLicencia from '@/pages/seguimiento-licencia/components/DialogLicencia.vue'
import { $api } from '@/utils/api'
import { definePage } from 'vue-router/auto'


const listaprogramacion = ref([])
const idSeleccionado = ref(null)
const lista_data = ref([])
const licenciasDelProyecto = ref([])

const isPageLoading = ref(false)
const openLicencia = ref(false)

const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
})


onMounted(cargarProyecto)

async function cargarProyecto() {
    isPageLoading.value = true;
    try {
        const response = await $api('internodal/listar-proyecto', { method: 'GET' })
        listaprogramacion.value = response.rows
    } catch (error) {
        console.error(error)
    } finally {
        isPageLoading.value = false;
    }
}

async function abrirDialogoLicencia(value) {
    console.log('abrirDialogoLicencia', value);
    idSeleccionado.value = value.id_proyecto;
    lista_data.value = value;
    const reponse = await $api(`internodal/buscar-licencia/${value.id_proyecto}`, {
        method: 'GET',
        onResponseError({response}){
            console.log(response);
            
        }
    })
    
    console.log('la cantidad de esto ses ', reponse.response.length);
    
    // Aquí deberías cargar las licencias existentes para este proyecto
    // y asignarlas a `licenciasDelProyecto`. Por ahora, lo dejamos vacío.
    licenciasDelProyecto.value = reponse.response || [] // Resetear o cargar datos

    openLicencia.value = true;
}

async function crearLicencia(data) {
    console.log(data);
    
    if (data.isedit) {
        console.log('aquí vamos a editar', data.licencias);        
        await editar(data.licencias)
    }else{
        console.log('aquí vamos a crear', data.licencias);
        await guardar(data.licencias)
    }



}

const guardar = async (data) => {
    isPageLoading.value = true
    try {
        const response = await $api('/internodal/registrar-licencia', {
            method: 'POST',
            body: data,
            onResponseError({response}){
                snackbar.message = response._data?.error || 'Ocurrió un error inesperado.';
                snackbar.color = 'error';
                snackbar.show = true;
            } 
        })

        if (response.success) {
            snackbar.message = 'Licencias guardadas correctamente.';
            snackbar.color = 'success';
            snackbar.show = true;
            openLicencia.value = false; 
            await cargarProyecto();
        }
    } catch (error) {
        snackbar.message = 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
        snackbar.color = 'error';
        snackbar.show = true;
    } finally {
        isPageLoading.value = false
    }
}

const editar = async (data) => {
    isPageLoading.value = true
    try {
        const response = await $api('/internodal/actualizar-registrar-licencias', {
            method: 'PUT',
            body: data,
            onResponseError({response}){
                snackbar.message = response._data?.error || 'Ocurrió un error inesperado.';
                snackbar.color = 'error';
                snackbar.show = true;
            } 
        })

        if (response.success) {
            snackbar.message = 'Licencias guardadas correctamente.';
            snackbar.color = 'success';
            snackbar.show = true;
            openLicencia.value = false; 
            await cargarProyecto();
        }
    } catch (error) {
        snackbar.message = 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.';
        snackbar.color = 'error';
        snackbar.show = true;
    } finally {
        isPageLoading.value = false
    }
}

definePage({
    meta: {
        roles: ['administrador']   // 👈 solo este rol puede entrar
    },
})

</script>