# Brújula Emocional AI

App de bienestar emocional con inteligencia artificial que analiza tu situación y te entrega orientación personalizada para navegar tus emociones.

## ¿Qué hace esta app?

El usuario completa un formulario con su nombre, edad, lo que está sintiendo y dónde se encuentra. Claude AI analiza esa información y devuelve tres tarjetas de orientación personalizada:

1. **¿Cómo gestionar mi emoción?** — explica la emoción detectada y cómo manejarla
2. **¿Qué puedo hacer ahora?** — acciones concretas e inmediatas según el contexto
3. **¿Qué debería evitar?** — comportamientos o decisiones a evitar en ese estado emocional

Cada tarjeta incluye una imagen contextual generada dinámicamente según la respuesta de la IA.

## Funcionalidades actuales

- Formulario validado con campos: nombre, edad, situación emocional y ubicación actual
- Detección automática de la emoción principal (ansiedad, tristeza, estrés, etc.)
- Orientación adaptada a la edad del usuario
- Skeleton loader animado mientras Claude procesa la respuesta
- Diseño dark mode con animaciones de fondo
- API key de Anthropic protegida en el servidor — nunca expuesta al navegador
- Responsive para móvil y escritorio

## Limitaciones conocidas / Mejoras futuras (v2)

- Botón de emergencia conectado a líneas de crisis telefónicas según país
- Detección automática de situaciones de riesgo para activar recursos de ayuda
- Historial de sesiones para ver evolución emocional en el tiempo
- Check-ins periódicos de seguimiento
- Soporte multiidioma

## Stack

- **Next.js 15** — frontend + API route serverless
- **Claude claude-sonnet-4-20250514 (Anthropic)** — análisis emocional con IA
- **Vercel** — deploy con variable de entorno protegida
- **Picsum Photos** — imágenes contextuales dinámicas

## Arquitectura de seguridad

```
Usuario (formulario)
  → Next.js frontend
    → /api/analyze (serverless — API key protegida en servidor)
      → Claude API (Anthropic)
    → Renderiza 3 tarjetas con orientación
  → Resultado visual
```

La clave `ANTHROPIC_API_KEY` vive únicamente en las variables de entorno de Vercel y nunca llega al navegador del usuario.

## Deploy en Vercel

1. Fork o clona este repo
2. Conecta en [vercel.com](https://vercel.com) → New Project → importa el repo
3. En **Environment Variables** añade:
   ```
   ANTHROPIC_API_KEY = sk-ant-...
   ```
4. Deploy

## Desarrollo local

```bash
npm install

# Crea .env.local con:
# ANTHROPIC_API_KEY=sk-ant-...

npm run dev
# Abre http://localhost:3000
```

## Estructura del proyecto

```
/
├── package.json
├── next.config.js
├── .gitignore
├── styles/
│   └── globals.css
└── pages/
    ├── _app.js
    ├── index.js          ← interfaz principal
    └── api/
        └── analyze.js    ← proxy seguro hacia Anthropic API
```

---

**Ignacio Briceño** · Portfolio de automatización e IA  
Claude AI (Anthropic) + Next.js + Vercel
