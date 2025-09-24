<template>

    <h5 class="text-center">en desarrollo</h5>

</template>

<script setup>
import { definePage } from 'vue-router/auto';



definePage({
    meta: {
        roles: ['administrador','tecnico','agente'],   // 👈 solo este rol puede entrar
    },
})

</script>