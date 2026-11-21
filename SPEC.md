# SPEC · ConvierteYA — Subproducto No. 5 "Aplicación Multiplataforma"

**Materia:** Aplicaciones Web Progresivas · Unidad I · Actividad Desarrollo
**Alumno:** Jahir Jaziel Serrano Arana · 10° D
**Repositorio:** `JazyelAe/ConvierteYA-Multiplataforma` (nuevo, público)
**Estado:** aprobado el 20/11/2026 · implementado · Release v1.0.1 · web publicada

## 1. Objetivo
Construir **una sola base de código** en JavaScript con **React Native + Expo** que funcione en **Android, iOS y Web**: un conversor de unidades y de divisas. El punto clave del reporte es demostrar que el **mismo código** produce:
- una **app web** publicada en GitHub Pages;
- una **app Android** (APK) que se ejecuta en un emulador, con capturas de ambas plataformas lado a lado.

iOS es compatible por diseño (Expo), pero **no se puede compilar ni probar aquí** porque requiere una Mac o una cuenta de Expo/Apple. Esto se dirá tal cual en el reporte.

## 2. Auditoría
- **Repo nuevo**, sin código previo.
- **Expo SDK 58** (versión estable actual en npm), Node 24 y npm 11 disponibles.
- **API de divisas:** `frankfurter.app` ahora **redirige** a `api.frankfurter.dev/v1`. Comprobado hoy: responde `1 USD = 19.0673 MXN`, permite llamadas desde el navegador (CORS `*`) y no pide clave.
- **No hay Android SDK local:** el APK se compila en GitHub Actions.

## 3. Requisitos funcionales
- **RF-1 Unidades por categoría.** Longitud, peso, temperatura y volumen, con 4 a 6 unidades cada una (por ejemplo m, km, cm, mi, ft, in; kg, g, lb, oz; °C, °F, K; L, mL, gal, taza). La conversión es en tiempo real mientras se escribe.
- **RF-2 Divisas con API pública.**
  - Tipos de cambio de **Frankfurter** (Banco Central Europeo) para MXN, USD, EUR, GBP, JPY, CAD y otras.
  - El **último resultado se guarda** con fecha. **Sin conexión** se usa ese respaldo y se muestra el aviso "Sin conexión · tipos del dd/mm/aaaa".
  - Botón para actualizar.
- **RF-3 Historial.** Las últimas 30 conversiones se guardan con **AsyncStorage** (en la web usa `localStorage` por debajo). Persisten al cerrar la app; se pueden borrar una por una o todas.
- **RF-4 Intercambiar y copiar.**
  - Botón ⇄ para intercambiar origen y destino.
  - Botón para **copiar el resultado al portapapeles** (`expo-clipboard`), con confirmación visual.
- **RF-5 Código compartido.**
  - Un solo `App.js` y componentes comunes para todas las plataformas.
  - Lo que difiere se resuelve con `Platform.OS` y se documenta: **vibración háptica** al copiar e intercambiar (`expo-haptics`) **solo en Android/iOS**, y un aviso discreto en lugar de una alerta nativa en la web.
  - Una etiqueta en pantalla indica en qué plataforma corre ("Android", "Web"), para que sea evidente en las capturas.

## 4. Requisitos no funcionales
- **RNF-1** JavaScript (sin TypeScript) y componentes cortos y comentados en español.
- **RNF-2** Diseño adaptable: en el celular ocupa la pantalla; en la computadora se centra con un ancho máximo de 480 px.
- **RNF-3** Tema claro y oscuro según el sistema (`useColorScheme`).
- **RNF-4** Lógica de conversión en funciones puras con pruebas `jest` (temperaturas, ida y vuelta, divisas).

## 5. Tecnologías
| Capa | Tecnología |
|---|---|
| Lenguaje | JavaScript (ES2022) |
| Framework | React Native + **Expo SDK 58** (react-native-web para la versión web) |
| Persistencia | `@react-native-async-storage/async-storage` |
| Portapapeles y háptica | `expo-clipboard`, `expo-haptics` |
| Datos remotos | API REST **Frankfurter** (`api.frankfurter.dev/v1`) con `fetch` |
| Pruebas | `jest` (funciones de conversión) + Playwright (web) + emulador Android con adb |
| Web | `npx expo export -p web` → **GitHub Pages** (`baseUrl: /ConvierteYA-Multiplataforma`) |
| Android | `npx expo prebuild -p android` + Gradle en GitHub Actions → APK en un **Release** (sin cuenta de Expo) |

## 6. Criterios de aceptación
| # | Criterio | Cómo se verifica |
|---|---|---|
| CA-1 | La versión web en Pages convierte unidades y divisas sin errores en la consola. | Playwright |
| CA-2 | **El mismo código** corre en Android: el APK generado con Expo se instala y abre en un emulador, y muestra los mismos resultados que la web. | Emulador Android 14 (adb) + capturas lado a lado |
| CA-3 | La API de divisas responde y, **sin conexión**, la app usa el último valor guardado y lo indica. | Playwright `set_offline` + modo avión en el emulador |
| CA-4 | El historial persiste al recargar (web) y al cerrar y volver a abrir (Android). | Playwright + adb |
| CA-5 | Intercambiar y copiar funcionan (el texto copiado coincide con el resultado). | Playwright (lectura del portapapeles) |
| CA-6 | `jest` pasa las pruebas de conversión. | Actions |
| CA-7 | README con capturas, instrucciones (incluido cómo abrirla con **Expo Go**) y enlaces. | Revisar el repo |

## 7. Plan de despliegue
- **Workflow `web.yml`:** en cada push corre `npm ci`, `npm test` y `expo export -p web`, y publica en **GitHub Pages**.
- **Workflow `android.yml`:** al crear una etiqueta `v*` corre `expo prebuild` y `./gradlew assembleRelease` (firmado con la llave de depuración) y adjunta el APK al **Release**.
- **Workflow `capturas.yml`:** el emulador Android 14 instala el APK y toma capturas con adb.
- **URL de la aplicación:** la web en Pages + el APK en el Release.
- **Expo Go (opcional, con tu teléfono):** `npx expo start --tunnel` y escanear el QR con la app Expo Go. No requiere cuenta. Solo si quieres fotos en tu propio teléfono.
- **EAS Build** (APK firmado en la nube de Expo) **no se usa**, porque requiere tu cuenta de Expo.

## 8. Capturas (automáticas)
- **Web (Playwright):**
  - Escritorio: `01_web_unidades.png`, `02_web_divisas.png`, `03_web_historial.png`.
  - Móvil (390×844): `04_web_movil.png`.
  - Sin conexión: `05_web_sin_conexion.png`.
- **Android (emulador):**
  - `06_android_unidades.png`, `07_android_divisas.png`, `08_android_historial.png`, `09_android_sin_conexion.png`, `10_android_icono.png`.
- **Comparativa:** `11_misma_app_web_android.png`, una imagen lado a lado (misma conversión en web y en Android).
- **Opcional:** 2 fotos con Expo Go en tu teléfono.

## 9. Ejemplos reales propuestos (comprobados con fuente oficial, 20/11/2026)
| App | Tecnología multiplataforma | Fuente oficial | URL |
|---|---|---|---|
| Discord | React Native (iOS y Android) | Blog de Discord: *How Discord achieves native iOS performance with React Native* | https://play.google.com/store/apps/details?id=com.discord |
| Microsoft Teams | React Native (móvil) | Vitrina oficial de React Native (reactnative.dev/showcase) | https://play.google.com/store/apps/details?id=com.microsoft.teams |
| Google Pay | Flutter | Vitrina oficial de Flutter (flutter.dev/showcase/google-pay) | https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user |

Fuentes técnicas (comprobadas): documentación de React Native, Expo (incluidos Expo Go y Clipboard), AsyncStorage y Frankfurter.

## 10. Pruebas
| # | Resultado | Evidencia |
|---|---|---|
| CA-1 | ✅ La web en Pages convierte unidades (10 km = 6.21371 mi, 37 °C = 98.6 °F) y divisas (100 USD = 1,906.71 MXN, igual que la API). Consola sin errores. **14/14** comprobaciones con Playwright. | `pruebas_web.txt`, `01`–`04` |
| CA-2 | ✅ El APK v1.0.1 se instala y abre en el emulador Pixel 6 con Android 14. Las mismas conversiones dan **los mismos resultados** que en la web, y la etiqueta muestra «Android · API 34». | `pruebas_emulador.txt`, `06`, `07`, `11_misma_app_web_android.png` |
| CA-3 | ✅ La API responde en ambas plataformas. Sin conexión (Chrome sin red; modo avión en Android) se muestra «Sin conexión · tipos del 20/11/2026» con el mismo resultado. | `05_web_sin_conexion.png`, `09_android_sin_conexion.png` |
| CA-4 | ✅ El historial persiste al recargar la web y tras `am force-stop` y volver a abrir la app en Android. Se puede borrar una entrada. | `03`, `08` |
| CA-5 | ✅ Intercambiar da 37 °F = 2.77778 °C. En la web se leyó el portapapeles real (`37 °F = 2.77778 °C`); en Android se ven el Toast y la vista previa del portapapeles del sistema. Hay 3 vibraciones registradas en `dumpsys vibrator_manager`. | `06b_android_copiar.png` |
| CA-6 | ✅ `jest`: 12/12 pruebas (en la PC y en Actions). | Actions |
| CA-7 | ✅ README con capturas, enlaces e instrucciones de Expo Go. | README.md |

**Incidencias encontradas y corregidas:**
- **Web:** el navegador respondía desde su caché HTTP (la API permite guardar un día) y la app decía «En línea» sin red. Se agregó `cache: 'no-store'`.
- **Android (v1.0.0):** React Native ignora `cache: 'no-store'` en Android, y OkHttp respondía desde su caché en modo avión. Se agregó una marca de tiempo única a la URL (`&t=...`) y se publicó la **v1.0.1**. La v1.0.0 sigue publicada, pero no debe usarse.
- **iOS:** no se compiló ni se probó (requiere una Mac o una cuenta de Expo/Apple).
