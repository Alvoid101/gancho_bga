// ============================================
// Configuración de Firebase
// ============================================
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase.
// Ve a https://console.firebase.google.com > Tu proyecto > Configuración > General
// y copia la configuración de tu app web.

const firebaseConfig = {
    apiKey: "AIzaSyD7RLo4DiF6VgX5d509fa17quIAdENx_vI",
    authDomain: "gancho-bga.firebaseapp.com",
    projectId: "gancho-bga",
    storageBucket: "gancho-bga.firebasestorage.app",
    messagingSenderId: "863981349027",
    appId: "1:863981349027:web:50cb1f5a7e6aafe1dcf716"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias a servicios
const auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
const db = firebase.firestore();

// API Key de ImgBB (servicio gratuito para subir imágenes)
// Obtén tu key gratis en: https://api.imgbb.com/
const IMGBB_API_KEY = "1f544f91365975b8d3424ba670a54f3f";
