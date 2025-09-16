<template>
  <VCard class="position-relative">
    <VCardText>
      <div class="mb-3">
        <h6 class="text-h6 text-wrap">
            <strong>{{ props.lista_seguimiento.nodo }} - {{ props.lista_seguimiento.region }} - {{ props.lista_seguimiento.dpto }} - {{ props.lista_seguimiento.nodo_concentrador }}</strong>
        </h6>
        <div class="text-subtitle-1">
          {{ props.lista_seguimiento.eecc }} <br> {{ props.lista_seguimiento.ip }}
        </div>
      </div>
      <h5 class="text-primary">
        {{ props.lista_seguimiento.uips }}
      </h5>
      <div class="text-body-1 mb-3">
        {{props.lista_seguimiento.status_pext_pct}}% avanzado
      </div>
      <VBtn size="small" @click="enviar">
        Ver detalle
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup>
import { type } from '@/views/components/alert/demoCodeAlert';


const props = defineProps({
    lista_seguimiento: {type:Object, default: () => ({})}
});

const emit = defineEmits(['cargar_detalle']);


const enviar = () => {
    emit('cargar_detalle', props.lista_seguimiento.id_proyecto);
}

</script>

<style lang="scss">
.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 6.625rem;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>
