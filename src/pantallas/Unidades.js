// Pantalla de unidades: se elige la categoría y se convierte en tiempo real mientras se escribe.
import { useState } from 'react';
import { View } from 'react-native';
import Conversor from '../componentes/Conversor';
import Opciones from '../componentes/Opciones';
import { CATEGORIAS, convertir, formatear, leerNumero } from '../conversiones';

// Unidades que se muestran al elegir cada categoría.
const INICIALES = { longitud: ['km', 'mi'], peso: ['kg', 'lb'], temperatura: ['°C', '°F'], volumen: ['L', 'gal'] };

export default function Unidades({ alCopiar, alGuardar }) {
  const [categoria, setCategoria] = useState('longitud');
  const [de, setDe] = useState('km');
  const [a, setA] = useState('mi');
  const [valor, setValor] = useState('10');

  function elegirCategoria(clave) {
    setCategoria(clave);
    setDe(INICIALES[clave][0]);
    setA(INICIALES[clave][1]);
  }

  const numero = leerNumero(valor);
  const resultado = `${formatear(convertir(categoria, numero, de, a))} ${a}`;
  const texto = `${formatear(numero)} ${de} = ${resultado}`; // lo que se copia y se guarda

  const categorias = Object.entries(CATEGORIAS).map(([clave, c]) => ({ clave, texto: c.nombre }));
  const unidades = Object.keys(CATEGORIAS[categoria].unidades).map((u) => ({ clave: u, texto: u }));

  return (
    <View style={{ gap: 12 }}>
      <Opciones opciones={categorias} seleccion={categoria} alElegir={elegirCategoria} />
      <Conversor
        valor={valor}
        alCambiarValor={setValor}
        opciones={unidades}
        de={de}
        a={a}
        alCambiarDe={setDe}
        alCambiarA={setA}
        alIntercambiar={() => { setDe(a); setA(de); }}
        resultado={resultado}
        alCopiar={() => alCopiar(texto, Number.isFinite(numero))}
        alGuardar={() => alGuardar(texto, CATEGORIAS[categoria].nombre, Number.isFinite(numero))}
      />
    </View>
  );
}
