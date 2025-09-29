import { reactive } from 'vue';

export function useSnackbar() {
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success',
  });

  function mostrarNotificacion(payload) {
    snackbar.message = payload.message;
    snackbar.color = payload.color;
    snackbar.show = true;
  }

  return {
    snackbar,
    mostrarNotificacion,
  };
}