// Pantalla de divisas: descarga los tipos de cambio de la API Frankfurter.
// Sin conexión usa los últimos guardados y lo indica con la fecha.
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Conversor, { Boton } from '../componentes/Conversor';
import { obtenerTipos } from '../almacen';
import { formatear, leerNumero } from '../conversiones';
import { MONEDAS, convertirDivisa, fechaCorta } from '../divisas';
import { useTema } from '../tema';

export default function Divisas({ alCopiar, alGuardar }) {
  const t = useTema();
  const [de, setDe] = useState('USD');
  const [a, setA] = useState('MXN');
  const [valor, setValor] = useState('100');
  const [tipos, setTipos] = useState(null); // { fecha, tasas, sinConexion }
  const [cargando, setCargando] = useState(true);

  async function actualizar() {
    setCargando(true);
    setTipos(await obtenerTipos());
    setCargando(false);
  }

  useEffect(() => { actualizar(); }, []);

  const numero = leerNumero(valor);
  const resultado = `${formatear(convertirDivisa(numero, de, a, tipos?.tasas), 2)} ${a}`;
  const texto = `${formatear(numero, 2)} ${de} = ${resultado}`;
  const monedas = Object.keys(MONEDAS).map((m) => ({ clave: m, texto: m }));

  let estado;
  if (cargando) estado = 'Consultando tipos de cambio…';
  else if (!tipos) estado = 'Sin conexión y sin tipos guardados. Conéctate y presiona Actualizar.';
  else if (tipos.sinConexion) estado = `Sin conexión · tipos del ${fechaCorta(tipos.fecha)}`;
  else estado = `En línea · tipos del BCE del ${fechaCorta(tipos.fecha)}`;
  const esAviso = !cargando && (!tipos || tipos.sinConexion);

  return (
    <View style={{ gap: 12 }}>
      <View style={[estilos.estado, { backgroundColor: esAviso ? t.avisoFondo : t.chip }]}>
        {cargando && <ActivityIndicator color={t.primario} />}
        <Text style={[estilos.estadoTexto, { color: esAviso ? t.aviso : t.texto }]} testID="estado-divisas">
          {estado}
        </Text>
      </View>
      <Conversor
        valor={valor}
        alCambiarValor={setValor}
        opciones={monedas}
        de={de}
        a={a}
        alCambiarDe={setDe}
        alCambiarA={setA}
        alIntercambiar={() => { setDe(a); setA(de); }}
        resultado={resultado}
        alCopiar={() => alCopiar(texto, Number.isFinite(numero) && !!tipos)}
        alGuardar={() => alGuardar(texto, 'Divisas', Number.isFinite(numero) && !!tipos)}
      />
      <Text style={[estilos.nota, { color: t.suave }]}>{MONEDAS[de]} → {MONEDAS[a]}</Text>
      <Boton texto="Actualizar tipos de cambio" alPresionar={actualizar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  estado: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  estadoTexto: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  nota: { fontSize: 13, textAlign: 'center' },
});
