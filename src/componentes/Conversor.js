// Tarjeta de conversión que comparten las pantallas de Unidades y Divisas:
// cantidad → "De" → botón ⇄ → "A" → resultado, más los botones Copiar y Guardar.
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Opciones from './Opciones';
import { useTema } from '../tema';

export default function Conversor({
  valor, alCambiarValor, opciones, de, a, alCambiarDe, alCambiarA,
  alIntercambiar, resultado, alCopiar, alGuardar,
}) {
  const t = useTema();
  return (
    <View style={[estilos.tarjeta, { backgroundColor: t.tarjeta, borderColor: t.borde }]}>
      <Text style={[estilos.etiqueta, { color: t.suave }]}>Cantidad</Text>
      <TextInput
        value={valor}
        onChangeText={alCambiarValor}
        keyboardType="decimal-pad"
        accessibilityLabel="Cantidad"
        testID="cantidad"
        placeholder="0"
        placeholderTextColor={t.suave}
        style={[estilos.entrada, { color: t.texto, borderColor: t.borde }]}
      />

      <Text style={[estilos.etiqueta, { color: t.suave }]}>De</Text>
      <Opciones opciones={opciones} seleccion={de} alElegir={alCambiarDe} prefijo="De" />

      <Pressable
        onPress={alIntercambiar}
        accessibilityRole="button"
        accessibilityLabel="Intercambiar"
        style={[estilos.intercambiar, { borderColor: t.primario }]}
      >
        <Text style={[estilos.intercambiarTexto, { color: t.primario }]}>↑↓  Intercambiar</Text>
      </Pressable>

      <Text style={[estilos.etiqueta, { color: t.suave }]}>A</Text>
      <Opciones opciones={opciones} seleccion={a} alElegir={alCambiarA} prefijo="A" />

      <View style={[estilos.caja, { backgroundColor: t.chip }]} testID="resultado">
        <Text style={[estilos.resultado, { color: t.texto }]} accessibilityLabel={`Resultado: ${resultado}`}>
          {resultado}
        </Text>
      </View>

      <View style={estilos.botones}>
        <Boton texto="Copiar" alPresionar={alCopiar} relleno />
        <Boton texto="Guardar en historial" alPresionar={alGuardar} />
      </View>
    </View>
  );
}

export function Boton({ texto, alPresionar, relleno }) {
  const t = useTema();
  return (
    <Pressable
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityLabel={texto}
      style={[
        estilos.boton,
        { borderColor: t.primario, backgroundColor: relleno ? t.primario : 'transparent' },
      ]}
    >
      <Text style={[estilos.botonTexto, { color: relleno ? t.sobrePrimario : t.primario }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  etiqueta: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  entrada: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 22 },
  intercambiar: { alignSelf: 'center', borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, marginTop: 4 },
  intercambiarTexto: { fontSize: 15, fontWeight: '600' },
  caja: { borderRadius: 12, padding: 14, marginTop: 4 },
  resultado: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  botones: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  boton: { flexGrow: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  botonTexto: { fontSize: 15, fontWeight: '600' },
});
