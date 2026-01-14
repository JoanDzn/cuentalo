# Cuentalo

Aplicación web de gestión de gastos e ingresos con entrada por voz.

## Características

- 💰 **Seguimiento de transacciones**: Registra ingresos y gastos con categorización automática
- 🎤 **Entrada por voz**: Agrega transacciones usando comandos de voz en español
- 📊 **Visualización de datos**: Dashboard con resumen de balance, ingresos y gastos
- 🌓 **Modo oscuro/claro**: Interfaz adaptable con transiciones suaves
- 💱 **Soporte multi-moneda**: Maneja USD y VES con conversión automática usando tasa BCV
- 📱 **Diseño responsivo**: Interfaz optimizada para diferentes tamaños de pantalla
- 💾 **Persistencia local**: Datos guardados en el navegador

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

## Uso

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Tecnologías

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- Web Speech API
