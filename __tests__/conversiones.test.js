// Pruebas de las funciones puras de conversión (RNF-4). Se ejecutan con: npm test
import { convertir, formatear, leerNumero } from '../src/conversiones';
import { convertirDivisa, fechaCorta, leerRespuesta } from '../src/divisas';

describe('unidades', () => {
  test('longitud: 10 km son 6.21371 mi', () => {
    expect(formatear(convertir('longitud', 10, 'km', 'mi'))).toBe('6.21371');
  });

  test('peso: 1 lb son 453.592 g', () => {
    expect(formatear(convertir('peso', 1, 'lb', 'g'))).toBe('453.592');
  });

  test('temperatura: puntos conocidos', () => {
    expect(convertir('temperatura', 100, '°C', '°F')).toBeCloseTo(212);
    expect(convertir('temperatura', 32, '°F', '°C')).toBeCloseTo(0);
    expect(convertir('temperatura', 0, 'K', '°C')).toBeCloseTo(-273.15);
    expect(convertir('temperatura', -40, '°C', '°F')).toBeCloseTo(-40);
  });

  test('ida y vuelta regresa al valor original en todas las categorías', () => {
    const casos = [['longitud', 'ft', 'cm'], ['peso', 'oz', 't'], ['temperatura', 'K', '°F'], ['volumen', 'taza', 'mL']];
    for (const [cat, de, a] of casos) {
      const ida = convertir(cat, 37.5, de, a);
      expect(convertir(cat, ida, a, de)).toBeCloseTo(37.5, 9);
    }
  });

  test('volumen: 1 gal son 3.78541 L', () => {
    expect(formatear(convertir('volumen', 1, 'gal', 'L'))).toBe('3.78541');
  });

  test('entrada inválida da NaN y se muestra como guion', () => {
    expect(convertir('longitud', NaN, 'm', 'km')).toBeNaN();
    expect(formatear(NaN)).toBe('—');
  });
});

describe('lectura y formato', () => {
  test('acepta coma o punto decimal', () => {
    expect(leerNumero('2,5')).toBe(2.5);
    expect(leerNumero(' 2.5 ')).toBe(2.5);
    expect(leerNumero('')).toBeNaN();
    expect(leerNumero('abc')).toBeNaN();
  });

  test('separa miles con comas y respeta decimales fijos', () => {
    expect(formatear(1234567.891)).toBe('1,234,570');
    expect(formatear(1908.7, 2)).toBe('1,908.70');
    expect(formatear(-1500, 2)).toBe('-1,500.00');
  });
});

describe('divisas', () => {
  // Respuesta de ejemplo con el formato real de api.frankfurter.dev/v1/latest
  const tipos = leerRespuesta({ amount: 1, base: 'EUR', date: '2026-11-20', rates: { USD: 1.1, MXN: 22, JPY: 170 } });

  test('agrega el euro como base y conserva la fecha', () => {
    expect(tipos.tasas.EUR).toBe(1);
    expect(tipos.fecha).toBe('2026-11-20');
  });

  test('convierte pasando por el euro', () => {
    expect(convertirDivisa(100, 'USD', 'MXN', tipos.tasas)).toBeCloseTo(2000);
    expect(convertirDivisa(22, 'MXN', 'EUR', tipos.tasas)).toBeCloseTo(1);
    expect(convertirDivisa(5, 'MXN', 'MXN', tipos.tasas)).toBeCloseTo(5);
  });

  test('sin tipos o moneda desconocida da NaN', () => {
    expect(convertirDivisa(1, 'USD', 'MXN', null)).toBeNaN();
    expect(convertirDivisa(1, 'USD', 'XXX', tipos.tasas)).toBeNaN();
  });

  test('fecha corta dd/mm/aaaa', () => {
    expect(fechaCorta('2026-11-20')).toBe('20/11/2026');
  });
});
