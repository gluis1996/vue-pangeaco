import { ref } from "vue";

const data = ref({
  status: true,
  rows: [
    { id_tipo: 1, nombre: "POSTES", unidad: "cant" },
    { id_tipo: 2, nombre: "CAMARAS", unidad: "cant" },
    { id_tipo: 3, nombre: "CANALIZADO", unidad: "metros" },
    { id_tipo: 4, nombre: "TENDIDO DE CABLE SUBTERRANEO", unidad: "metros" },
    { id_tipo: 5, nombre: "TENDIDO DE CABLE AÉREO", unidad: "metros" },
    { id_tipo: 6, nombre: "INSTALACION PASIVOS", unidad: "cant" },
    { id_tipo: 7, nombre: "PRUEBAS", unidad: "cant" },
  ]
});

export default data;