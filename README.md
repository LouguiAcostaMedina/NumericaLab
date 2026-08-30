# Calculadora de Métodos Numéricos

Una plataforma web interactiva de última generación para la resolución de ecuaciones no lineales utilizando métodos numéricos iterativos. Diseñada con una estética moderna estilo dashboard, permite a los usuarios calcular raíces, analizar el decaimiento del error porcentual relativo a través de gráficas y exportar reportes de iteraciones a múltiples formatos.

## Características

* **5 Algoritmos Numéricos Implementados**:
  * **Método de Bisección**: Algoritmo cerrado que divide sucesivamente a la mitad el intervalo que contiene la raíz.
  * **Método de Falsa Posición**: Algoritmo cerrado basado en interpolación lineal entre extremos.
  * **Método de Newton-Raphson**: Algoritmo abierto que utiliza la derivada simbólica para una convergencia rápida.
  * **Método de Punto Fijo**: Algoritmo abierto que resuelve la ecuación a partir de su forma despejada $x = g(x)$.
  * **Método de la Secante**: Algoritmo abierto que aproxima la derivada usando dos semillas iniciales.
* **Evaluación Simbólica y Derivación**: Parser matemático avanzado para evaluar expresiones de forma segura y calcular derivadas de forma analítica en el cliente.
* **Gráficas de Convergencia**: Visualización interactiva del decaimiento del error relativo porcentual ($\varepsilon_a$ vs Iteración) por medio de gráficos de líneas dinámicos.
* **Exportación Multi-formato**: Descarga de los resultados de las iteraciones en formatos **CSV** (optimizado para Excel), **Excel (.xlsx)** y reporte en **PDF** con formato profesional.
* **UI/UX Premium**: Soporte responsivo completo para móviles y escritorio, estados activos de sidebar temáticos y Skeleton Loaders durante el procesamiento.

## Stack Tecnológico

* **Core**: [React 19](https://react.dev/) & [Next.js 16](https://nextjs.org/) (App Router)
* **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
* **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Matemáticas**: [mathjs](https://mathjs.org/) (Parser y diferenciación simbólica)
* **Gráficos**: [Recharts](https://recharts.org/)
* **Exportación**:
  * [xlsx](https://www.npmjs.com/package/xlsx) (Generación de hojas de cálculo de Excel)
  * [jspdf](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (Generación de reportes PDF estructurados)

## Instalación y Uso Local

Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/software-metodos-numericos.git
cd software-metodos-numericos
```

### 2. Instalar dependencias
Instala los paquetes necesarios utilizando npm:
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
Inicia el entorno de desarrollo local:
```bash
npm run dev
```

El servidor estará corriendo en [http://localhost:3000](http://localhost:3000). Abre este enlace en tu navegador para ver la aplicación.

### 4. Compilar para Producción
Para generar el build optimizado de producción (ideal para desplegar en plataformas como Vercel):
```bash
npm run build
```

## Despliegue en Vercel

Este proyecto está configurado para compilarse y desplegarse automáticamente en Vercel mediante su integración con GitHub. Solo conecta tu repositorio a un nuevo proyecto en Vercel y se detectará automáticamente el framework de Next.js.
