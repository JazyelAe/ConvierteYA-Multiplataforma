// Divisas: la API pública Frankfurter publica los tipos de cambio del Banco Central Europeo.
// No necesita clave y permite llamadas desde el navegador (CORS), así que sirve igual en web y en el teléfono.

export const MONEDAS = {
  MXN: 'Peso mexicano',
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  GBP: 'Libra esterlina',
  JPY: 'Yen japonés',
  CAD: 'Dólar canadiense',
};

// Se piden los tipos con base en el euro (la base de la API). Ejemplo: { USD: 1.099, MXN: 20.95, ... }
export const URL_API = 'https://api.frankfurter.dev/v1/latest?symbols=MXN,USD,GBP,JPY,CAD';

// Convierte de una moneda a otra pasando por el euro. "tasas" dice cuántas unidades equivalen a 1 euro.
export function convertirDivisa(valor, de, a, tasas) {
  if (!Number.isFinite(valor) || !tasas || !tasas[de] || !tasas[a]) return NaN;
  return (valor / tasas[de]) * tasas[a];
}

// Convierte la respuesta de la API ({ date, rates }) al formato que guarda la app.
export function leerRespuesta(datos) {
  return { fecha: datos.date, tasas: { ...datos.rates, EUR: 1 } };
}

// "2026-11-20" → "20/11/2026"
export function fechaCorta(iso) {
  const [anio, mes, dia] = String(iso).slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}
