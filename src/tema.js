// Colores de la app. Se elige claro u oscuro según la configuración del sistema (useColorScheme).
import { useColorScheme } from 'react-native';

const CLARO = {
  fondo: '#EEF3F2',
  tarjeta: '#FFFFFF',
  texto: '#16232B',
  suave: '#5A6873',
  borde: '#D5DFDD',
  primario: '#0B7A64',
  sobrePrimario: '#FFFFFF',
  chip: '#E2ECE9',
  aviso: '#9A5B00',
  avisoFondo: '#FFF3DC',
};

const OSCURO = {
  fondo: '#0E1518',
  tarjeta: '#182227',
  texto: '#E6EEF1',
  suave: '#9AABB4',
  borde: '#2A3940',
  primario: '#3CC9A7',
  sobrePrimario: '#06231C',
  chip: '#22323A',
  aviso: '#FFCF7A',
  avisoFondo: '#3A2C10',
};

export function useTema() {
  return useColorScheme() === 'dark' ? OSCURO : CLARO;
}
