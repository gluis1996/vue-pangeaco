<template>
    <h4>Gestion de Ruta</h4>
    <TdListaProgramacion :listaprogramcion="listaapi" @verDetalle="abrirDetalle" />
    <br>
    <TdDetalleRutaProgramacion :listaapiRutas="listaapiRutas"/>
</template>

<script setup>
import TdListaProgramacion from '@/pages/gestion-ruta/components/tabla-programaciones.vue'
import TdDetalleRutaProgramacion from '@/pages/gestion-ruta/components/tabla-detalle-ruta-programacion.vue'
import { $api } from '@/utils/api';
import { onMounted, ref } from 'vue';

const listaapi = ref([]);
const listaapiRutas = ref([])
onMounted(()=>{
        cargarprogramaciones()
});

// funcion de llamda a la api y genera la lista
const cargarprogramaciones = async ()=>{
    try {
        const response = await $api('gestionrutas/listar-prograciones',{
            method: 'GET',
            onResponseError({ response }) {
            console.error('Respuesta API no OK:', response)
            }}
        )
        listaapi.value = response.rows;        
    } catch (error) {
        console.log(error);        
    }
}

const abrirDetalle = async (data)=>{
    try {
        const response = await $api(`gestionrutas/buscar-rutas-prograciones/${data}`,{
            method: 'GET',
            onResponseError({response}){
                console.error('Respuesta API no OK:', response)
            }
        })
        console.log(data);
        console.log(response);       
        
        listaapiRutas.value = response.rows;
    } catch (error) {
        console.log(error);        
    }
}

</script>