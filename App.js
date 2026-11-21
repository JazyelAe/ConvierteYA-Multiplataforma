// ConvierteYA · un solo código (React Native + Expo) para Android, iOS y Web.
// App.js arma la pantalla: encabezado, pestañas y el historial compartido.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import Unidades from './src/pantallas/Unidades';
import Divisas from './src/pantallas/Divisas';
import Historial from './src/pantallas/Historial';
import { cargarHistorial, guardarHistorial, MAXIMO_HISTORIAL } from './src/almacen';
import { NOMBRE_PLATAFORMA, avisar, vibrar } from './src/plataforma';
import { useTema } from './src/tema';

const PESTANAS = [
  { clave: 'unidades', texto: 'Unidades' },
  { clave: 'divisas', texto: 'Divisas' },
  { clave: 'historial', texto: 'Historial' },
];

function Principal() {
  const t = useTema();
  const margen = useSafeAreaInsets();
  const [pestana, setPestana] = useState('unidades');
  const [historial, setHistorial] = useState([]);
  const [avisoWeb, setAvisoWeb] = useState(null); // aviso dibujado por la app (solo en la web)
  const temporizador = useRef(null);

  useEffect(() => { cargarHistorial().then(setHistorial); }, []);

  function mostrarAvisoWeb(texto) {
    setAvisoWeb(texto);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setAvisoWeb(null), 2500);
  }

  function cambiarHistorial(nueva) {
    setHistorial(nueva);
    guardarHistorial(nueva);
  }

  async function copiar(texto, valido) {
    if (!valido) return avisar('Escribe una cantidad válida', mostrarAvisoWeb);
    await Clipboard.setStringAsync(texto);
    vibrar();
    avisar(`Copiado: ${texto}`, mostrarAvisoWeb);
  }

  function guardar(texto, tipo, valido) {
    if (!valido) return avisar('Escribe una cantidad válida', mostrarAvisoWeb);
    const entrada = { id: String(Date.now()), texto, tipo, fecha: new Date().toISOString() };
    cambiarHistorial([entrada, ...historial].slice(0, MAXIMO_HISTORIAL));
    vibrar();
    avisar('Guardado en el historial', mostrarAvisoWeb);
  }

  // Las tres pantallas siempre están montadas y solo se oculta la inactiva,
  // así no se pierde lo escrito al cambiar de pestaña.
  const visible = (clave) => ({ display: pestana === clave ? 'flex' : 'none' });

  return (
    <View style={[estilos.raiz, { backgroundColor: t.fondo, paddingTop: margen.top }]}>
      <StatusBar style="auto" />
      <View style={estilos.columna}>
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: t.texto }]}>ConvierteYA</Text>
          <Text style={[estilos.plataforma, { color: t.primario, borderColor: t.primario }]} testID="plataforma">
            {NOMBRE_PLATAFORMA}
          </Text>
        </View>
        <View style={[estilos.pestanas, { backgroundColor: t.chip }]}>
          {PESTANAS.map(({ clave, texto }) => (
            <Pressable
              key={clave}
              onPress={() => setPestana(clave)}
              accessibilityRole="tab"
              accessibilityLabel={texto}
              accessibilityState={{ selected: pestana === clave }}
              style={[estilos.pestana, pestana === clave && { backgroundColor: t.tarjeta }]}
            >
              <Text style={{ color: pestana === clave ? t.primario : t.suave, fontWeight: '700' }}>
                {clave === 'historial' && historial.length ? `${texto} (${historial.length})` : texto}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[estilos.columna, { paddingBottom: margen.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={visible('unidades')}><Unidades alCopiar={copiar} alGuardar={guardar} /></View>
        <View style={visible('divisas')}><Divisas alCopiar={copiar} alGuardar={guardar} /></View>
        <View style={visible('historial')}>
          <Historial
            lista={historial}
            alBorrar={(id) => cambiarHistorial(historial.filter((h) => h.id !== id))}
            alBorrarTodo={() => cambiarHistorial([])}
          />
        </View>
      </ScrollView>

      {avisoWeb && (
        <View style={[estilos.avisoWeb, { backgroundColor: t.texto }]} accessibilityRole="alert">
          <Text style={{ color: t.fondo, fontWeight: '600' }}>{avisoWeb}</Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Principal />
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  // En la computadora el contenido se centra con un ancho máximo de 480 px; en el teléfono ocupa todo.
  columna: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 16, gap: 12 },
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  titulo: { fontSize: 26, fontWeight: '800' },
  plataforma: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, fontSize: 13, fontWeight: '700' },
  pestanas: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 12 },
  pestana: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 },
  avisoWeb: {
    position: 'absolute', bottom: 24, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, maxWidth: '90%',
  },
});
