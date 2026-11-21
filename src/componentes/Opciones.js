// Fila de botones ("chips") para elegir una opción: unidad, moneda o categoría.
// Se usa en todas las pantallas y en todas las plataformas (Pressable funciona igual en web y en el teléfono).
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTema } from '../tema';

// opciones: [{ clave, texto }] · prefijo: se agrega a la etiqueta accesible (por ejemplo "De" o "A").
export default function Opciones({ opciones, seleccion, alElegir, prefijo }) {
  const t = useTema();
  return (
    <View style={estilos.fila}>
      {opciones.map(({ clave, texto }) => {
        const activa = clave === seleccion;
        return (
          <Pressable
            key={clave}
            onPress={() => alElegir(clave)}
            accessibilityRole="button"
            accessibilityLabel={prefijo ? `${prefijo}: ${texto}` : texto}
            accessibilityState={{ selected: activa }}
            style={[estilos.chip, { backgroundColor: activa ? t.primario : t.chip }]}
          >
            <Text style={[estilos.texto, { color: activa ? t.sobrePrimario : t.texto }]}>{texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, minWidth: 48, alignItems: 'center' },
  texto: { fontSize: 15, fontWeight: '600' },
});
