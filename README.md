# Calculadora de Métodos Numéricos

Una plataforma web interactiva de última generación para la resolución de ecuaciones no lineales, sistemas de ecuaciones lineales y polinomios utilizando métodos numéricos iterativos. Diseñada con una estética moderna estilo dashboard, permite a los usuarios calcular resultados exactos, ver la resolución paso a paso (con un enfoque académico), analizar el decaimiento del error porcentual y exportar reportes de iteraciones a múltiples formatos.

## Características

* **Resolución Manual Paso a Paso (Nuevo en v0.2.0)**:
  * El sistema no funciona como una caja negra. Cada método puede desplegar un panel que explica y simula las sustituciones matemáticas, la formulación de matrices y los cálculos iniciales, ideal para el seguimiento y revisión de tareas manuales (especialmente para métodos de sistemas lineales).

* **Sistemas de Ecuaciones Lineales**:
  * **Método de Doolittle (Factorización LU)**: Generación de las matrices L y U con 1s en la diagonal principal.
  * **Método de Jacobi**: Método iterativo clásico con validación estricta de dominancia diagonal y sustitución vectorial.
  * **Método de Gauss-Seidel**: Versión acelerada de Jacobi con uso de los valores más actualizados y el cálculo del Criterio de Sassenfeld.

* **Interpolación y Polinomios**:
  * **Interpolación de Lagrange**: Construcción de los factores $L_k(x)$ y representación simplificada del polinomio interpolador final.
  * **Raíces de Polinomios (Método de Müller)**: Implementación para raíces complejas en plano y análisis con la Regla de Descartes.

* **Cálculo de Raíces No Lineales**:
  * **Bisección**, **Falsa Posición**, **Newton-Raphson**, **Punto Fijo** y la **Secante**.

* **Evaluación Simbólica y Derivación**: Parser matemático avanzado para evaluar expresiones de forma segura y calcular derivadas de forma analítica en el cliente.
* **Exportación Multi-formato**: Descarga de los resultados en **CSV** (optimizado para Excel), **Excel (.xlsx)** y reportes en **PDF** con formato profesional.

## Arquitectura del Proyecto

El proyecto está diseñado bajo un modelo de arquitectura limpia separando estrictamente la presentación de los algoritmos:
- `/core/math`: Contiene todos los módulos algorítmicos. Ningún archivo en esta carpeta depende de React. Devuelven objetos tipados puros y arreglos de pasos (tipo `ProcedureStep`).
- `/core/domain`: Define las estructuras de datos (Types/Interfaces) universales, por ejemplo, los tipos para el sistema unificado de pasos, las matrices y las respuestas genéricas `MethodResponse`.
- `/components`: Interfaz de usuario pura. Consumen la información generada por `/core` (como los pasos lógicos de `ProcedureStepRenderer`) y los renderizan mediante modales y componentes de acordeón polimórficos (`ManualSolutionView`).

## Stack Tecnológico

* **Core**: [React 19](https://react.dev/) & [Next.js 16](https://nextjs.org/) (App Router)
* **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
* **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Testing**: [Vitest](https://vitest.dev/) (Para pruebas unitarias lógicas en `/core`)
* **Matemáticas**: [mathjs](https://mathjs.org/) (Parser y diferenciación simbólica)
* **Gráficos**: [Recharts](https://recharts.org/)
* **Exportación**:
  * [xlsx](https://www.npmjs.com/package/xlsx) & [jspdf](https://github.com/parallax/jsPDF)

## Instalación, Pruebas y Uso Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/software-metodos-numericos.git
cd software-metodos-numericos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar las Pruebas Unitarias
El proyecto cuenta con un entorno configurado en Vitest para proteger contra regresiones en la lógica matemática.
```bash
npm run test
```

### 4. Ejecutar el servidor de desarrollo
Inicia el entorno de desarrollo local:
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### 5. Compilar para Producción
```bash
npm run build
```

## Convenciones de Git y Desarrollo

El proyecto sigue una estrategia de ramas estructurada:
- `main`: Rama de producción estable.
- `fix/*`: Ramas temporales para corrección de bugs, regresiones y deuda técnica (tipos inseguros, dependencias faltantes).
- `feature/*`: Ramas temporales para incorporar grandes módulos como la resolución paso a paso.
- `docs/*`: Actualizaciones a documentación y control de versión.

## Versión
**Versión Actual:** v0.2.0
El sistema actualiza su versión Menor (Minor) al introducir motores funcionales nuevos que mantienen compatibilidad retrospectiva (ej: la Arquitectura de Paso a Paso de esta versión).
