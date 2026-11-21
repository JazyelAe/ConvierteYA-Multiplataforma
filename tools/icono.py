"""Genera el ícono de ConvierteYA (dos flechas opuestas = convertir) en todos los tamaños que pide Expo.
Uso: python tools/icono.py"""
from PIL import Image, ImageDraw

VERDE = (11, 122, 100, 255)
BLANCO = (255, 255, 255, 255)

def flechas(tam, color, escala):
    """Dibuja una flecha a la derecha (arriba) y otra a la izquierda (abajo), centradas."""
    img = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c, s = tam / 2, tam * escala  # s = ancho total del dibujo
    grueso, punta = s * 0.13, s * 0.30
    for y, derecha in ((c - s * 0.2, True), (c + s * 0.2, False)):
        x0, x1 = c - s / 2, c + s / 2
        if derecha:
            d.rectangle([x0, y - grueso / 2, x1 - punta * 0.8, y + grueso / 2], fill=color)
            d.polygon([(x1, y), (x1 - punta, y - punta * 0.75), (x1 - punta, y + punta * 0.75)], fill=color)
        else:
            d.rectangle([x0 + punta * 0.8, y - grueso / 2, x1, y + grueso / 2], fill=color)
            d.polygon([(x0, y), (x0 + punta, y - punta * 0.75), (x0 + punta, y + punta * 0.75)], fill=color)
    return img

def con_fondo(tam, radio):
    img = Image.new("RGBA", (tam, tam), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle([0, 0, tam - 1, tam - 1], radius=radio, fill=VERDE)
    img.alpha_composite(flechas(tam, BLANCO, 0.62))
    return img

con_fondo(1024, 0).save("assets/icon.png")                       # iOS y tiendas (sin transparencia en esquinas)
flechas(1024, BLANCO, 0.42).save("assets/android-icon-foreground.png")  # dentro de la zona segura (66 %)
flechas(1024, BLANCO, 0.42).save("assets/android-icon-monochrome.png")
flechas(1024, VERDE, 0.6).save("assets/splash-icon.png")
con_fondo(48, 10).save("assets/favicon.png")
print("Íconos generados en assets/")
