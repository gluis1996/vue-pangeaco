import { ref } from "vue";

const data = ref({
  status: true,
  rows: [
    { id_tipo: 1, nombre: "POSTES", unidad: "metros" },
    { id_tipo: 2, nombre: "CAMARAS", unidad: "metros" },
    { id_tipo: 3, nombre: "CANALIZADO", unidad: "metros" },
    { id_tipo: 4, nombre: "TENDIDO DE CABLE SUBTERRANEO", unidad: "metros" },
    { id_tipo: 5, nombre: "TENDIDO DE CABLE AÉREO", unidad: "metros" },
    { id_tipo: 6, nombre: "INSTALACION PASIVOS", unidad: "metros" },
  ]
});

export default data;