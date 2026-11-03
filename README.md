# Taller Acero

Calculadoras de taller que funcionan sin conexión: peso de materiales, viga apoyada, soldadura de filete,
plegado en prensa, desvío de cañería, agujeros en círculo (PCD), ángulos y pendientes, capacidad de tanque,
lista de corte y conversor de unidades.

## Cómo obtener el APK

**Opción A: GitHub (sin instalar nada)**
1. Creá un repositorio en GitHub y subí el contenido de esta carpeta.
2. Entrá a la pestaña *Actions*, elegí *Compilar APK* y tocá *Run workflow*.
3. Cuando termine (unos 3 minutos), descargá `taller-acero-apk` y adentro está `app-debug.apk`.
4. Pasalo al celular, abrilo y permití instalar desde fuentes desconocidas.

**Opción B: Android Studio**
1. Abrí la carpeta `android/` con Android Studio.
2. Esperá la sincronización de Gradle y andá a *Build > Build APK(s)*.

**Opción C: sin APK**
Subí la carpeta `web/` a cualquier hosting con HTTPS (GitHub Pages sirve). Abrila en Chrome del celular
y elegí *Instalar app* o *Agregar a pantalla de inicio*. Queda como una app y funciona sin conexión.

## Estructura
- `src/app.html`: código fuente de la app (un solo archivo).
- `build.py`: genera `web/` y copia la app a `android/app/src/main/assets/`. Correlo después de editar `src/app.html`.
- `test/calc.test.js`: pruebas de las fórmulas con valores conocidos (`node test/calc.test.js`).
- `android/`: proyecto Android (WebView), mínimo Android 8.0.

Los resultados son orientativos. Antes de fabricar o montar una estructura, verificá con la norma aplicable.
