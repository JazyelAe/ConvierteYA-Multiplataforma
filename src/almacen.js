// Persistencia con AsyncStorage: en Android/iOS se guarda en el almacenamiento de la app
// y en la web usa localStorage por debajo. El código es el mismo para todas las plataformas.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URL_API, leerRespuesta } from './divisas';

const CLAVE_HISTORIAL = 'convierteya.historial';
const CLAVE_TIPOS = 'convierteya.tipos';
export const MAXIMO_HISTORIAL = 30;

export async function cargarHistorial() {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_HISTORIAL);
    return texto ? JSON.parse(texto) : [];
  } catch {
    return [];
  }
}

export async function guardarHistorial(lista) {
  await AsyncStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(lista.slice(0, MAXIMO_HISTORIAL)));
}

// Pide los tipos de cambio. Si no hay Internet, regresa los últimos guardados con sinConexion = true.
// Si nunca se descargaron, regresa null.
export async function obtenerTipos() {
  const control = new AbortController();
  const limite = setTimeout(() => control.abort(), 8000); // no esperar para siempre
  try {
    // cache: 'no-store' evita que el navegador responda con una copia vieja de su caché
    // y la app diga "En línea" sin red. Sin conexión, fetch falla y se usa el respaldo guardado.
    const respuesta = await fetch(URL_API, { signal: control.signal, cache: 'no-store' });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const tipos = leerRespuesta(await respuesta.json());
    await AsyncStorage.setItem(CLAVE_TIPOS, JSON.stringify(tipos));
    return { ...tipos, sinConexion: false };
  } catch {
    const guardado = await AsyncStorage.getItem(CLAVE_TIPOS);
    return guardado ? { ...JSON.parse(guardado), sinConexion: true } : null;
  } finally {
    clearTimeout(limite);
  }
}
