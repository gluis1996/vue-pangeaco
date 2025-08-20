<template>
    <VRow>
        <VCol>
            <VBtn 
                color="primary"
                @click="mostrardialog=true"
                >
                Nueva Registro
            </VBtn>
        </VCol>
    </VRow>
    <br>
    
    <dialogregistro v-model:isDialogVisible="mostrardialog"/>
    <tabla @notify="showalert"/>


    <VSnackbar
      v-model="alert.show"
      location="top"
    >
      {{ alert.text }}
    </VSnackbar>

</template>

<script setup>
import { VCol } from 'vuetify/components';
import { ref } from 'vue';
import dialogregistro from "@/pages/reasignacion/components/dialogRegistro.vue"
import tabla from "@/pages/reasignacion/components/tabla.vue"

const mostrardialog = ref(false)

const alert = ref({
    show: false,
    type: "",
    text: ""
})

const showalert = (payload = {}) => {
    const { type = "" ,text = "" } = payload;
    alert.value.show = true
    alert.value.type = type
    alert.value.text = text
    clearTimeout(showalert._t)
    showalert._t = setTimeout(() => (alert.value.show = false), 3000)
};

definePage({
    meta: {
        roles: ['administrador'],   // 👈 solo este rol puede entrar
    },
})
</script>