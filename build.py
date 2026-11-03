#!/usr/bin/env python3
"""Arma web/ (PWA instalable) y los assets del proyecto Android a partir de src/app.html."""
import re, shutil, struct, zlib, pathlib

root = pathlib.Path(__file__).parent
src = (root / "src" / "app.html").read_text(encoding="utf-8")

title = re.search(r"<title>(.*?)</title>", src).group(1)
body = re.sub(r"<title>.*?</title>\s*", "", src, count=1)
body = re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\s*', "", body)
fonts = re.findall(r'<link[^>]*>', body)
body = re.sub(r'<link[^>]*>\s*', "", body)

head = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="theme-color" content="#1b5e8c">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
{chr(10).join(fonts)}
</head>
<body>
"""
sw_reg = """<script>
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
"""
html = head + body + sw_reg + "</body>\n</html>\n"

web = root / "web"
web.mkdir(exist_ok=True)
(web / "index.html").write_text(html, encoding="utf-8")

(web / "manifest.webmanifest").write_text("""{
  "name": "Taller Acero",
  "short_name": "Taller Acero",
  "description": "Calculadoras de taller: peso de materiales, vigas, soldadura, plegado, cañerías y más.",
  "lang": "es",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#edeff1",
  "theme_color": "#1b5e8c",
  "icons": [
    {"src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
    {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
  ]
}
""", encoding="utf-8")

(web / "sw.js").write_text("""const CACHE = 'taller-acero-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && new URL(e.request.url).origin === location.origin) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
""", encoding="utf-8")

# Iconos PNG: viga en I blanca sobre azul acero, con marca amarilla.
def icon(size):
    bg, fg, mark = (27, 94, 140), (245, 247, 248), (233, 194, 22)
    px = [[bg] * size for _ in range(size)]
    def rect(x0, y0, x1, y1, c):
        for y in range(int(y0 * size), int(y1 * size)):
            for x in range(int(x0 * size), int(x1 * size)):
                px[y][x] = c
    rect(.26, .24, .74, .33, fg)   # ala superior
    rect(.26, .67, .74, .76, fg)   # ala inferior
    rect(.455, .33, .545, .67, fg) # alma
    rect(.26, .80, .50, .84, mark) # marca
    raw = b"".join(b"\x00" + bytes(v for p in row for v in p) for row in px)
    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))

for s in (192, 512):
    (web / f"icon-{s}.png").write_bytes(icon(s))

# Assets del proyecto Android
assets = root / "android/app/src/main/assets"
assets.mkdir(parents=True, exist_ok=True)
shutil.copy(web / "index.html", assets / "index.html")
print("OK: web/ y android assets generados")
