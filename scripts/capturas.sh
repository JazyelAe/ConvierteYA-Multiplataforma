#!/usr/bin/env bash
# Toma capturas REALES de ConvierteYA en un emulador Android con adb y UI Automator,
# repitiendo las mismas conversiones que la prueba web para comparar ambas plataformas.
# Lo ejecuta .github/workflows/capturas.yml. Uso: bash scripts/capturas.sh ConvierteYA.apk
set -u
APK="$1"
PKG="com.jaziel.convierteya"
mkdir -p capturas
LOG=capturas/pruebas.txt
: > "$LOG"
anota() { echo "$*" | tee -a "$LOG"; }

# Devuelve "x1 y1 x2 y2" del primer elemento cuyo texto o descripción coincide (primero exacto, luego "contiene").
limites() {
  # El volcado falla si la pantalla sigue animándose ("could not get idle state"): se reintenta.
  for intento in 1 2 3 4 5; do
    rm -f ui.xml
    adb shell rm -f /sdcard/ui.xml >/dev/null 2>&1
    adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1
    adb pull /sdcard/ui.xml ui.xml >/dev/null 2>&1
    if [ -s ui.xml ]; then
      python3 - "$1" <<'PY'
import re, sys, xml.etree.ElementTree as ET
buscado = sys.argv[1]
nodos = list(ET.parse("ui.xml").iter("node"))
for exacto in (True, False):
    for n in nodos:
        for valor in (n.get("text") or "", n.get("content-desc") or ""):
            if (valor == buscado) if exacto else (buscado in valor):
                print(*re.findall(r"\d+", n.get("bounds")))
                sys.exit(0)
sys.exit(1)  # la pantalla se leyó bien, pero el elemento no está
PY
      return $?
    fi
    sleep 1
  done
  return 1
}

centro() { local b; b=$(limites "$1"); [ -z "$b" ] && return 1; set -- $b; echo "$(( ($1+$3)/2 )) $(( ($2+$4)/2 ))"; }
existe() { [ -n "$(limites "$1")" ]; }
esperar() { for i in $(seq 1 ${2:-15}); do existe "$1" && return 0; sleep 2; done; return 1; }
cap() { sleep 1; adb exec-out screencap -p > "capturas/$1"; anota "captura: $1"; }

tocar() { # tocar "texto" — reintenta unos segundos si todavía no aparece
  for intento in 1 2 3 4 5; do
    local xy; xy=$(centro "$1") && { adb shell input tap $xy; sleep 1.5; anota "  tocado: $1"; return 0; }
    sleep 2
  done
  anota "  ERROR: no encontré $1"; return 1
}

# Toca y captura enseguida, para que salga el Toast nativo de Android (dura unos 2 segundos).
tocar_y_capturar() {
  local xy; xy=$(centro "$1") || { anota "  ERROR: no encontré $1"; return 1; }
  adb shell input tap $xy; sleep 0.7
  adb exec-out screencap -p > "capturas/$2"; anota "  tocado: $1 · captura: $2"
  sleep 2
}

escribir_cantidad() { # borra la cantidad y escribe otra con el teclado
  tocar "Cantidad"
  adb shell input keyevent KEYCODE_MOVE_END
  adb shell input keyevent 67 67 67 67 67 67 67 67   # 67 = borrar
  adb shell input text "$1"; sleep 1
  adb shell input keyevent KEYCODE_BACK; sleep 1      # oculta el teclado
}

comprobar() { # comprobar "texto esperado" "descripción"
  if esperar "$1" 5; then anota "$2: OK ($1)"; else anota "$2: FALLÓ (no aparece «$1»)"; fi
}

# ---------- Arranque del emulador en español ----------
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done
adb root >/dev/null 2>&1; sleep 3
adb shell "setprop persist.sys.locale es-MX; setprop ctl.restart zygote"; sleep 15
for i in $(seq 1 60); do adb shell dumpsys activity activities 2>/dev/null | grep -q "ResumedActivity.*launcher" && break; sleep 3; done
sleep 10
adb shell input keyevent KEYCODE_WAKEUP; adb shell wm dismiss-keyguard
for s in window_animation_scale transition_animation_scale animator_duration_scale; do adb shell settings put global $s 0; done
anota "== Dispositivo: $(adb shell getprop ro.product.model) · Android $(adb shell getprop ro.build.version.release) (API $(adb shell getprop ro.build.version.sdk)) · idioma $(adb shell getprop persist.sys.locale)"

adb install -r "$APK" && anota "CA-2 instalación del APK: OK"
abrir() { for i in 1 2 3 4 5; do adb shell am start -W -n "$PKG/.MainActivity" >/dev/null; sleep 4; esperar "ConvierteYA" 5 && return 0; done; return 1; }
if abrir; then anota "CA-2 la app abre: OK"; else
  anota "ERROR: la app no abrió. Registro del sistema (logcat):"
  adb logcat -d -t 400 | grep -iE "ReactNative|convierteya|AndroidRuntime|FATAL" | tail -60 | tee -a "$LOG"
  cap 00_error.png; exit 1
fi
comprobar "Android · API 34" "RF-5 etiqueta de plataforma"

# 1. Unidades: los mismos casos que en la web
comprobar "6.21371 mi" "CA-2 10 km → mi (igual que en la web)"
tocar "Temperatura"
escribir_cantidad 37
comprobar "98.6 °F" "CA-2 37 °C → °F (igual que en la web)"
tocar_y_capturar "Guardar en historial" 06_android_unidades.png

# 2. Intercambiar y copiar (Toast nativo + vibración)
tocar "Intercambiar"
comprobar "2.77778 °C" "CA-5 intercambiar"
tocar_y_capturar "Copiar" 06b_android_copiar.png

# 3. Divisas con la API Frankfurter
ESPERADO=$(curl -s "https://api.frankfurter.dev/v1/latest?symbols=MXN,USD,GBP,JPY,CAD" |
  python3 -c "import json,sys; r=json.load(sys.stdin)['rates']; print(f'{100/r[\"USD\"]*r[\"MXN\"]:,.2f} MXN')")
tocar "Divisas"
esperar "En línea · tipos del BCE" 10 && anota "CA-3 la API responde en Android: OK"
comprobar "$ESPERADO" "CA-2 100 USD → MXN coincide con la API"
cap 07_android_divisas.png
tocar "Guardar en historial"; sleep 2

# 4. Historial y persistencia al cerrar y volver a abrir
tocar "Historial"
comprobar "2 de 30 conversiones guardadas" "Historial con 2 conversiones"
cap 08_android_historial.png
adb shell am force-stop "$PKG"; sleep 1; abrir
tocar "Historial"
comprobar "2 de 30 conversiones guardadas" "CA-4 el historial persiste al cerrar y abrir"

# 5. Sin conexión (modo avión): usa los tipos guardados
adb shell cmd connectivity airplane-mode enable; sleep 4
anota "Modo avión: $(adb shell settings get global airplane_mode_on | tr -d '\r') (1 = activado)"
adb shell am force-stop "$PKG"; sleep 1; abrir
tocar "Divisas"
esperar "Sin conexión · tipos del" 10 && anota "CA-3 sin conexión usa los tipos guardados: OK"
comprobar "$ESPERADO" "CA-3 mismo resultado sin conexión"
cap 09_android_sin_conexion.png
adb shell cmd connectivity airplane-mode disable; sleep 3

# 6. Vibración háptica registrada por el sistema (solo en el teléfono)
anota "-- Vibraciones de la app (expo-haptics):"
adb shell dumpsys vibrator_manager 2>/dev/null | grep -i "$PKG" | head -3 | cut -c1-220 | tee -a "$LOG"

# 7. Modo oscuro del sistema (useColorScheme)
adb shell cmd uimode night yes; sleep 3
tocar "Unidades"; sleep 1
cap 12_android_oscuro.png
adb shell cmd uimode night no; sleep 2

# 8. Icono en el cajón de apps
TAM=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${TAM%x*}; H=${TAM#*x}
adb shell input keyevent KEYCODE_HOME; sleep 2
adb shell input swipe $((W/2)) $((H*85/100)) $((W/2)) $((H*20/100)) 300; sleep 3
cap 10_android_icono.png
anota "-- Errores de JavaScript en logcat:"
adb logcat -d 2>/dev/null | grep -E "ReactNativeJS.*(Error|error)|FATAL EXCEPTION" | tail -15 | cut -c1-220 | tee -a "$LOG"
anota "== Fin"
