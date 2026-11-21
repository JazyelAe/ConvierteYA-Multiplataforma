// Historial: las últimas 30 conversiones guardadas. Se borran una por una o todas.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '../componentes/Conversor';
import { useTema } from '../tema';

function fechaHora(iso) {
  const d = new Date(iso);
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

export default function Historial({ lista, alBorrar, alBorrarTodo }) {
  const t = useTema();
  if (lista.length === 0) {
    return (
      <Text style={[estilos.vacio, { color: t.suave }]}>
        Aún no hay conversiones guardadas. Usa «Guardar en historial» en Unidades o Divisas.
      </Text>
    );
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ color: t.suave }}>{lista.length} de 30 conversiones guardadas</Text>
      {lista.map((item) => (
        <View key={item.id} style={[estilos.fila, { backgroundColor: t.tarjeta, borderColor: t.borde }]}>
          <View style={{ flex: 1 }}>
            <Text style={[estilos.texto, { color: t.texto }]}>{item.texto}</Text>
            <Text style={{ color: t.suave, fontSize: 12 }}>{item.tipo} · {fechaHora(item.fecha)}</Text>
          </View>
          <Pressable
            onPress={() => alBorrar(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Borrar ${item.texto}`}
            style={estilos.borrar}
          >
            <Text style={{ color: t.suave, fontSize: 18 }}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Boton texto="Borrar todo el historial" alPresionar={alBorrarTodo} />
    </View>
  );
}

const estilos = StyleSheet.create({
  vacio: { textAlign: 'center', marginTop: 24, fontSize: 15 },
  fila: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  texto: { fontSize: 16, fontWeight: '600' },
  borrar: { padding: 8 },
});
