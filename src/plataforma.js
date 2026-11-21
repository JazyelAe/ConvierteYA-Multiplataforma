// Lo ÚNICO que cambia según la plataforma está aquí, resuelto con Platform.OS.
// El resto de la app es exactamente el mismo código para Android, iOS y Web.
import { Platform, ToastAndroid, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

// Etiqueta visible en pantalla para que se note en qué plataforma corre.
export const NOMBRE_PLATAFORMA = Platform.select({
  android: `Android · API ${Platform.Version}`,
  ios: `iOS ${Platform.Version}`,
  default: 'Web',
});

// Vibración háptica: solo existe en el teléfono; en la web no se hace nada.
export function vibrar() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}

// Aviso corto: en Android un Toast nativo, en iOS una alerta nativa y en la web
// un aviso dibujado por la propia app (mostrarEnWeb), porque el navegador no tiene Toast.
export function avisar(texto, mostrarEnWeb) {
  if (Platform.OS === 'android') ToastAndroid.show(texto, ToastAndroid.SHORT);
  else if (Platform.OS === 'ios') Alert.alert(texto);
  else mostrarEnWeb(texto);
}
