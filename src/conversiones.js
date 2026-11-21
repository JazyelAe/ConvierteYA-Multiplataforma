// Lógica de conversión de unidades: funciones puras (sin React), las mismas en Android, iOS y Web.
// Cada unidad tiene un "factor": cuántas unidades base vale. Para convertir se pasa por la unidad base.

export const CATEGORIAS = {
  longitud: {
    nombre: 'Longitud',
    unidades: {
      m: { nombre: 'Metro', factor: 1 },
      km: { nombre: 'Kilómetro', factor: 1000 },
      cm: { nombre: 'Centímetro', factor: 0.01 },
      mi: { nombre: 'Milla', factor: 1609.344 },
      ft: { nombre: 'Pie', factor: 0.3048 },
      in: { nombre: 'Pulgada', factor: 0.0254 },
    },
  },
  peso: {
    nombre: 'Peso',
    unidades: {
      kg: { nombre: 'Kilogramo', factor: 1 },
      g: { nombre: 'Gramo', factor: 0.001 },
      lb: { nombre: 'Libra', factor: 0.45359237 },
      oz: { nombre: 'Onza', factor: 0.028349523125 },
      t: { nombre: 'Tonelada', factor: 1000 },
    },
  },
  temperatura: {
    nombre: 'Temperatura',
    // La temperatura no se convierte con un factor: usa fórmulas (ver aCelsius y deCelsius).
    unidades: {
      '°C': { nombre: 'Celsius' },
      '°F': { nombre: 'Fahrenheit' },
      K: { nombre: 'Kelvin' },
    },
  },
  volumen: {
    nombre: 'Volumen',
    unidades: {
      L: { nombre: 'Litro', factor: 1 },
      mL: { nombre: 'Mililitro', factor: 0.001 },
      gal: { nombre: 'Galón (EE. UU.)', factor: 3.785411784 },
      taza: { nombre: 'Taza (EE. UU.)', factor: 0.2365882365 },
      'm³': { nombre: 'Metro cúbico', factor: 1000 },
    },
  },
};

function aCelsius(valor, unidad) {
  if (unidad === '°F') return (valor - 32) * 5 / 9;
  if (unidad === 'K') return valor - 273.15;
  return valor;
}

function deCelsius(valor, unidad) {
  if (unidad === '°F') return valor * 9 / 5 + 32;
  if (unidad === 'K') return valor + 273.15;
  return valor;
}

// Convierte "valor" de la unidad "de" a la unidad "a" dentro de una categoría.
export function convertir(categoria, valor, de, a) {
  if (!Number.isFinite(valor)) return NaN;
  if (categoria === 'temperatura') return deCelsius(aCelsius(valor, de), a);
  const unidades = CATEGORIAS[categoria].unidades;
  return (valor * unidades[de].factor) / unidades[a].factor;
}

// Lee lo que escribe el usuario. Acepta coma o punto decimal ("2,5" o "2.5").
export function leerNumero(texto) {
  const limpio = String(texto).trim().replace(',', '.');
  if (limpio === '' || limpio === '-' || limpio === '.') return NaN;
  return Number(limpio);
}

// Formatea un número igual en todas las plataformas (no depende del Intl de cada motor de JavaScript).
// "decimales" fija los decimales (para dinero). Si no se indica, se redondea a 6 cifras significativas.
export function formatear(n, decimales) {
  if (!Number.isFinite(n)) return '—';
  let texto = decimales === undefined ? String(Number(n.toPrecision(6))) : n.toFixed(decimales);
  if (texto.includes('e')) return texto; // números muy grandes o muy pequeños: notación científica
  const [entero, fraccion] = texto.split('.');
  const conComas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraccion ? `${conComas}.${fraccion}` : conComas;
}
