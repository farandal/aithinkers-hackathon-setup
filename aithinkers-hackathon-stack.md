# Preparación Stack

# [Generative UI Global Hackathon: Agentic Interfaces](https://santiago.aitinkerers.org/hackathons/h_LoGdPiECnm4) **\#1 \- Introducción al stack**  A2UI, AG-UI, CopilotKit y MCP Apps

#  Este conjunto de herramientas te permitirá construir aplicaciones donde los agentes de IA generan sus propias interfaces de usuario en tiempo real.

### **0\. Requisitos Previos**

Antes de comenzar, asegúrate de tener instalados los siguientes componentes básicos en tu Mac:

* **Node.js** (Versión 20 o superior).  
* **Python** (Versión 3.9 o superior).  
* **uv** (Administrador de paquetes de Python): Puedes instalarlo con el comando `curl -LsSf https://astral.sh/uv/install.sh | sh`.  
* **Clave de API de Gemini**: Necesaria para que los agentes funcionen. Obtén una en Google AI Studio.

### **1\. Instalación de CopilotKit y AG-UI**

**CopilotKit** es el framework de React principal que integra todo. **AG-UI** es el protocolo de transporte que viene incluido por defecto en CopilotKit.

**Crea un nuevo proyecto:** Ejecuta el asistente de línea de comandos en tu terminal:  
 npx cpk-cli@latest

1. **Configura el proyecto:** El CLI te guiará. Selecciona **ADK** (Agent Development Kit) cuando te pregunte por el framework del agente.  
2. **Configura el entorno:** Entra en la carpeta `agent/` de tu proyecto y crea un archivo `.env` con tu clave de API:  
    GOOGLE\_API\_KEY=tu\_clave\_aqui  
3. **Inicia el servidor:**  
    npm run dev  
4.  Esto iniciará tanto el frontend (React) como el backend del agente simultáneamente.

### **2\. Integración de A2UI (Protocolo de Google DeepMind)**

A2UI permite que el agente envíe descripciones declarativas de UI en formato JSON.

**Habilitar en el Backend:** En tu archivo de ruta (ej. `app/api/copilotkit/route.ts`), activa la herramienta de A2UI en el runtime de CopilotKit:  
 // app/api/copilotkit/route.ts  
const runtime \= new CopilotRuntime({  
  a2ui: { injectA2UITool: true } // Inyecta la herramienta para que el agente genere UI  
});

1. **Configurar el Frontend:** El renderizador de A2UI en CopilotKit se activa automáticamente. Si deseas usar componentes personalizados (**BYOC**), debes definirlos con **Zod** y pasarlos al `CopilotKitProvider` en tu `layout.tsx`.

### **3\. Configuración de MCP Apps**

Las MCP Apps son aplicaciones que se renderizan como interfaces en vivo dentro de un iframe seguro.

**Instalar el SDK de MCP:**  
 npm install @modelcontextprotocol/ext-apps

1. **Uso de Skills (Opcional pero recomendado):** Si usas un agente como **Claude Code**, puedes instalar una "habilidad" para andamiar proyectos de MCP Apps automáticamente:  
    claude install-skill create-mcp-app  
2. **Conectar con CopilotKit:** Para que tu aplicación de CopilotKit reconozca las MCP Apps, debes añadir el middleware correspondiente en el backend:  
    // app/api/copilotkit/route.ts  
   import { MCPAppsMiddleware } from "@copilotkit/runtime";  
   // ... dentro de la configuración del runtime  
   middleware: \[new MCPAppsMiddleware()\]

### 

* **Desarrollo del Agente:** Usarás el ADK de Google para definir la lógica del agente en Python.  
* **Comunicación:** Los mensajes y estados fluirán a través de **AG-UI**.  
* **Visualización:** El frontend en React usará componentes de CopilotKit para mostrar chats, formularios generados por **A2UI** o herramientas embebidas de **MCP Apps**.  
* **Pruebas:** Puedes probar la integración completa navegando a `http://localhost:3000` una vez iniciado el servidor de desarrollo.

# Instrucciones Mac

# [Generative UI Global Hackathon: Agentic Interfaces](https://santiago.aitinkerers.org/hackathons/h_LoGdPiECnm4) **\#2 \- Entorno de desarrollo dockerizado Mac**

## **🐳 Paso 1: Crear la estructura del proyecto**

carpeta para el stack:

bash  
mkdir genui-hackathon  
cd genui-hackathon

Dentro de ella, vamos a tener:

* `Dockerfile` → define la imagen base.  
* `docker-compose.yml` → orquesta servicios si necesitas más de uno.  
* `agent/` → carpeta del agente (Python).  
* `frontend/` → carpeta del frontend (React con CopilotKit).

## **⚙️ Paso 2: Dockerfile base**

Aquí un ejemplo de Dockerfile que incluye Node.js 20, Python 3.11, uv y las dependencias clave:

dockerfile  
\# Imagen base con Node y Python  
FROM node:20-bullseye

\# Instalar Python y uv  
RUN apt-get update && apt-get install \-y python3 python3-pip curl \\  
    && curl \-LsSf https://astral.sh/uv/install.sh | sh \\  
    && rm \-rf /var/lib/apt/lists/\*

\# Crear directorios de trabajo  
WORKDIR /workspace

\# Instalar CopilotKit CLI globalmente  
RUN npm install \-g cpk-cli@latest

\# Copiar archivos del proyecto  
COPY . .

\# Instalar dependencias del frontend  
WORKDIR /workspace/frontend  
RUN npm install

\# Instalar dependencias del agente (Python)  
WORKDIR /workspace/agent  
RUN uv pip install \-r requirements.txt

\# Volver al workspace  
WORKDIR /workspace

\# Exponer puertos  
EXPOSE 3000

\# Comando por defecto: iniciar frontend \+ backend  
CMD \["npm", "run", "dev", "--prefix", "frontend"\]

## **📦 Paso 3: docker-compose.yml**

Si quieres separar frontend y backend en servicios distintos:

yaml  
version: "3.9"  
services:  
  frontend:  
    build: .  
    working\_dir: /workspace/frontend  
    command: npm run dev  
    ports:  
      \- "3000:3000"  
    volumes:  
      \- .:/workspace

  agent:  
    build: .  
    working\_dir: /workspace/agent  
    command: uv run python main.py  
    environment:  
      \- GOOGLE\_API\_KEY=${GOOGLE\_API\_KEY}  
    volumes:  
      \- .:/workspace

## **🔑 Paso 4: Variables de entorno**

En `agent/.env`:

env  
GOOGLE\_API\_KEY=tu\_clave\_de\_gemini

## **🧩 Paso 5: Inicializar CopilotKit y AG-UI**

Dentro del contenedor:

bash  
npx cpk-cli@latest

Selecciona **ADK (Agent Development Kit)** como framework del agente. Esto creará la estructura necesaria.

## **🖼️ Paso 6: Integrar A2UI**

En `frontend/app/api/copilotkit/route.ts`:

ts  
const runtime \= new CopilotRuntime({  
  a2ui: { injectA2UITool: true },  
});

## **🪟 Paso 7: Configurar MCP Apps**

Instala el SDK:

bash  
npm install @modelcontextprotocol/ext-apps

Agrega el middleware:

ts  
import { MCPAppsMiddleware } from "@copilotkit/runtime";

const runtime \= new CopilotRuntime({  
  middleware: \[new MCPAppsMiddleware()\],  
});

## **🚀 Flujo final**

Levanta el contenedor:  
bash  
docker-compose up \--build

1. Abre [http://localhost:3000](https://localhost:3000) para ver el frontend.  
2. El backend del agente corre en paralelo dentro del mismo stack.

# Instrucciones Windows

# Introducción para principiantes sobre **Docker** y **WSL2**, enfocada en cómo se usan en Windows para preparar tu ambiente de desarrollo hackathon.

# ---

## **🐳 ¿Qué es Docker?**

* # **Docker** es una plataforma que permite empaquetar aplicaciones y sus dependencias en contenedores.

* # Un **contenedor** es como una “cajita” que incluye todo lo necesario para que tu aplicación funcione: sistema operativo mínimo, librerías, dependencias y tu código.

* # Ventaja: no importa si usas Windows, Linux o Mac, el contenedor se comporta igual en cualquier máquina. Esto evita el clásico “en mi PC funciona, pero en la tuya no”.

# 👉 Piensa en Docker como una forma de tener mini-máquinas virtuales ligeras, rápidas y fáciles de mover.

# ---

## **🖥️ ¿Qué es WSL2?**

* # **WSL2** significa *Windows Subsystem for Linux 2*.

* # Es una tecnología que te permite correr un sistema Linux dentro de Windows, sin necesidad de instalar una máquina virtual pesada.

* # Docker Desktop en Windows usa WSL2 como motor para ejecutar contenedores, porque Docker está diseñado originalmente para Linux.

* # Con WSL2 puedes abrir una terminal Ubuntu dentro de Windows y trabajar como si estuvieras en Linux, pero integrado con tu sistema.

# 👉 Piensa en WSL2 como un “puente” que conecta Windows con Linux para que Docker funcione de manera eficiente.

# ---

## **🔗 Cómo se relacionan Docker y WSL2 en Windows**

1. # **Docker Desktop** se instala en Windows.

2. # Docker usa **WSL2** como backend para correr los contenedores.

3. # Tú trabajas desde Windows, pero los contenedores realmente se ejecutan dentro de ese entorno Linux que WSL2 provee.

4. # Esto te permite tener un stack moderno (Node.js, Python, uv, CopilotKit, etc.) sin preocuparte por compatibilidad de dependencias.

# ---

## **🚀 Flujo típico para principiantes**

1. # Instalar **Docker Desktop** en Windows.

2. # Activar **WSL2** y elegir una distribución (ej. Ubuntu).

3. # Crear tu proyecto con un `Dockerfile` y `docker-compose.yml`.

4. # Levantar el stack con `docker-compose up`.

5. # Abrir [http://localhost:3000](http://localhost:3000/) y ver tu aplicación corriendo dentro del contenedor.

# ---

## **🎯 Beneficios para tu hackathon**

* # **Reproducible**: todos los miembros del equipo usan el mismo contenedor.

* # **Portátil**: puedes mover tu proyecto a cualquier máquina sin problemas.

* # **Aislado**: no ensucias tu Windows con instalaciones de Node/Python.

* # **Escalable**: puedes añadir servicios (frontend, backend, base de datos) fácilmente con `docker-compose`.

# 

# 

# 

# 

# [Generative UI Global Hackathon: Agentic Interfaces](https://santiago.aitinkerers.org/hackathons/h_LoGdPiECnm4) **\#2 \- Entorno de desarrollo Windows (No probado)**

### **01 Instalar Node.js y Python**

Necesitas Node.js 20+ y Python 3.9+ en tu sistema.  
Descarga desde nodejs.org y python.org

* Instala **Node.js v20 LTS** desde el instalador oficial  
* Instala **Python 3.11** (recomendado) desde python.org  
* Verifica con `node -v` y `python --version`

### **02 Instalar uv en Windows**

uv es el gestor de paquetes de Python que usarás.  
Ejecuta en PowerShell

* Abre PowerShell como administrador  
* Ejecuta: `curl -LsSf https://astral.sh/uv/install.sh | sh`  
* Verifica con `uv --version`

### **03 Instalar Docker Desktop**

Docker te permitirá contenerizar tu ambiente completo.  
Descarga desde docker.com

* Instala **Docker Desktop for Windows**  
* Activa la integración con WSL2 (recomendado)  
* Verifica con `docker --version`

### **04 Crear proyecto CopilotKit**

Usarás el CLI para inicializar tu proyecto.  
En PowerShell o CMD

* Ejecuta: `npx cpk-cli@latest`  
* Selecciona **ADK (Agent Development Kit)**  
* Se generará la carpeta `agent/` y `frontend/`

### **05 Configurar variables de entorno**

Necesitas tu clave de Gemini para el agente.  
Crear archivo `.env` en `agent/`

* Añade: `GOOGLE_API_KEY=tu_clave`  
* Guarda el archivo  
* Asegúrate de no subirlo a repositorios públicos

### **06 Preparar Dockerfile**

Define la imagen con Node, Python y uv.  
Crea archivo `Dockerfile` en raíz

* Usa imagen base `node:20-bullseye`  
* Instala Python y uv  
* Copia tu proyecto  
* Expón puerto 3000  
* CMD: `npm run dev --prefix frontend`

### **07 Levantar con Docker Compose**

Orquesta frontend y backend en contenedores separados.  
Archivo `docker-compose.yml`

* Define servicio `frontend` con puerto 3000  
* Define servicio `agent` con Python y uv  
* Ejecuta: `docker-compose up --build`

### **08 Probar integración**

Verifica que todo esté corriendo correctamente.  
Navega en tu navegador

* Abre [http://localhost:3000](https://localhost:3000)  
* Prueba que el agente responde  
* Asegúrate que A2UI y MCP Apps se renderizan

  Con esto tendrás tu stack completo en Windows, aislado en Docker, listo para el hackathon.

# **\#3 \- Entorno de desarrollo Dockerizado.**

Ejemplo concreto de cómo preparar tu stack en **Windows con WSL2 y Docker** para el hackathon. Esto te permitirá correr todo el entorno de desarrollo (Node.js, Python, uv, CopilotKit, AG-UI, A2UI y MCP Apps) dentro de contenedores reproducibles.

## **🐳 Dockerfile (multi-stage optimizado)**

Guárdalo como `Dockerfile` en la raíz de tu proyecto:

dockerfile  
\# Etapa 1: Base con Node y Python  
FROM node:20-bullseye AS base

\# Instalar Python y uv  
RUN apt-get update && apt-get install \-y python3 python3-pip curl \\  
    && curl \-LsSf https://astral.sh/uv/install.sh | sh \\  
    && rm \-rf /var/lib/apt/lists/\*

WORKDIR /workspace

\# Etapa 2: Dependencias del frontend  
FROM base AS frontend  
WORKDIR /workspace/frontend  
COPY frontend/package\*.json ./  
RUN npm install

\# Etapa 3: Dependencias del agente  
FROM base AS agent  
WORKDIR /workspace/agent  
COPY agent/requirements.txt .  
RUN uv pip install \-r requirements.txt

\# Etapa final: entorno de desarrollo  
FROM base AS dev  
WORKDIR /workspace  
COPY . .

\# Exponer puerto del frontend  
EXPOSE 3000

\# Comando por defecto: iniciar frontend  
CMD \["npm", "run", "dev", "--prefix", "frontend"\]

## **📦 docker-compose.yml**

Guárdalo en la raíz del proyecto:

yaml  
version: "3.9"  
services:  
  frontend:  
    build:  
      context: .  
      target: dev  
    working\_dir: /workspace/frontend  
    command: npm run dev  
    ports:  
      \- "3000:3000"  
    volumes:  
      \- .:/workspace  
    environment:  
      \- GOOGLE\_API\_KEY=${GOOGLE\_API\_KEY}

  agent:  
    build:  
      context: .  
      target: agent  
    working\_dir: /workspace/agent  
    command: uv run python main.py  
    volumes:  
      \- .:/workspace  
    environment:  
      \- GOOGLE\_API\_KEY=${GOOGLE\_API\_KEY}

## **⚙️ Pasos en Windows con WSL2**

1. **Instalar WSL2 y Docker Desktop**  
   * Activa WSL2 con Ubuntu desde Microsoft Store.  
   * Instala Docker Desktop y configúralo para usar WSL2 como backend.  
     

**2\. Clonar tu proyecto**

bash  
git clone https://github.com/tu-repo/genui-hackathon.git

cd genui-hackathon

2. **Configurar variables de entorno**  

En tu `.env` (en la raíz del proyecto):  
env  
GOOGLE\_API\_KEY=tu\_clave\_de\_gemini

3. **Levantar el stack**  
   bash  
   docker-compose up \--build  
4. **Probar la integración**  

Abre [http://localhost:3000](https://localhost:3000) en tu navegador.

5. El frontend estará corriendo y el backend del agente se ejecutará en paralelo.

## **🚀 Flujo de trabajo**

* **Desarrollo del agente**: Python \+ ADK en `/agent`.  
* **Frontend React**: CopilotKit \+ AG-UI en `/frontend`.  
* **UI dinámica**: A2UI renderiza JSON declarativo.  
* **Apps embebidas**: MCP Apps dentro de iframes seguros.

## **🐳 Reseñas de Docker en Windows/WSL2**

**Levanta tu stack con docker-compose**  

Desde tu proyecto:  
bash  
docker-compose up \--build \-d

1. El `-d` lo deja corriendo en segundo plano.

**Lista los contenedores activos**

bash  
docker ps

Esto te mostrará algo como:

Code  
CONTAINER ID   IMAGE         COMMAND        PORTS     NAMES  
a1b2c3d4e5f6   genui-hackathon-frontend   ...   3000/tcp   genui-hackathon-frontend-1

**Entrar al contenedor con bash**  

Usa el nombre del servicio (ej. `genui-hackathon-frontend-1`):  
bash  
docker exec \-it genui-hackathon-frontend-1 bash

* `exec` → ejecuta un comando dentro del contenedor.  
  * `-it` → modo interactivo con terminal.  
  * `bash` → abre una shell dentro del contenedor.

**Ya dentro del contenedor**  

Verás un prompt tipo `root@...:/workspace/frontend#`.  
Aquí puedes correr:

bash  
npx cpk-cli@latest

## **🖥️ Alternativa con WSL2**

Si prefieres usar directamente tu terminal Ubuntu en WSL2:

* Abre **Ubuntu (WSL2)** desde el menú de Windows.  
* Navega a tu carpeta del proyecto (que está montada en `/mnt/c/...`).  
* Ejecuta los mismos comandos de Docker (`docker ps`, `docker exec`, etc.).

## **🚀 Flujo resumido**

1. `docker-compose up -d` → levanta los servicios.  
2. `docker ps` → identifica el nombre del contenedor.  
3. `docker exec -it <nombre> bash` → entras al contenedor.  
4. Dentro: `npx cpk-cli@latest` → inicializas CopilotKit.

# Prueba de concpeto

### **PoC Técnico para A2UI, CopilotKit, AG-UI y MCP**

El proyecto consistirá en implementar un “laboratorio” dinámico, también conocido como panel de trabajo, utilizando A2UI, CopilotKit, AG-UI y MCP siguiendo un patrón de **UI Generativa Declarativa**, lo que permitirá al agente elegir la disposición y los componentes óptimos para mostrar los datos del laboratorio según la información devuelta por el Agente a través de un MCP que ejecutará tareas específicas mediante sus herramientas. La interfaz será similar a **NotebookLm**, un UI tipo chat, que mostrará en una barra lateral componentes personalizados de acuerdo con la salida del agente.

#### **1\. Componente de Laboratorio (BYOC)**

Dado que un laboratorio requiere visualizaciones específicas para renderizar los datos que el agente entrega mediante el MCP, se extenderá el catálogo integrado de A2UI con componentes personalizados en React.

Se usará **Zod** para definir las props de los componentes del panel. Por ejemplo, un componente de gráfico que requiera una cadena de unidad y puntos de datos para renderizarse. Estos esquemas se mapearán a los componentes React disponibles en el frontend, y se usará la función `createCatalog` para asegurar la seguridad de tipos entre la salida del agente y el componente UI.

#### **2\. Agente para Procesar Datos de Laboratorio**

El agente (construido con ADK) actuará como el “cerebro” que decide qué elementos del panel son relevantes para los datos “contextuales” actuales.

* **Ingeniería de prompts**: se usará un `A2uiSchemaManager` para inyectar las definiciones de los componentes React del “laboratorio” en el prompt del sistema del agente.  
* El agente emitirá 3 sobres de mensaje estándar hacia A2UI:  
  * `surfaceUpdate`: define la estructura y disposición del panel.  
  * `dataModelUpdate`: llena el panel con valores reales del laboratorio.  
  * `beginRendering`: indica al frontend que muestre el resultado final.

El objetivo es generar un panel estructurado en lugar de muros de texto, permitiendo que el agente extraiga insights de investigaciones complejas y entregue datos formateados al frontend para mostrarlos adecuadamente.

#### **3\. Frontend en React**

En la aplicación React:

* **CopilotKit** actúa como el orquestador.  
* **AG-UI** maneja el transporte en tiempo real de los eventos del panel.  
* El módulo del panel se envolverá en `CopilotKitProvider` y se pasará un catálogo de laboratorio personalizado al renderer para que sepa cómo dibujar los componentes especializados.  
* Se usará `createA2UIMessageRenderer` para indicar a CopilotKit que interprete la salida JSON transmitida por el agente como la UI del panel.

Además, se implementará un **estado compartido** que utiliza el hook `useAgent` para suscribirse a cambios de estado, permitiendo que el panel se actualice dinámicamente si el agente recibe nuevos datos de sensores vía herramientas MCP.

#### **4\. Opcional: MCP Especializado**

Aunque este proyecto es una **Prueba de Concepto Tecnológica** para interfaces de laboratorio complejas que van más allá de tarjetas declarativas, la implementación de MCP personalizados depende del laboratorio específico. Se proveerá una integración de muestra con un componente de gráficos que muestre datos producidos por el MCP de ejemplo.

El agente llamará a una herramienta en un servidor MCP, que devolverá una referencia a una aplicación totalmente interactiva renderizada dentro del panel.

La sincronización bidireccional mediante la implementación de iframe permitirá comunicarse de vuelta con el host React, permitiendo al agente actualizar el estado principal del laboratorio según las interacciones del usuario dentro de la herramienta embebida.

### **Resumen del Flujo**

* Los datos del laboratorio son ingeridos por el agente mediante una llamada MCP.  
* El agente razona sobre los datos y genera JSON de A2UI describiendo el panel.  
* AG-UI transmite estos mensajes JSON al frontend React como eventos en tiempo real.  
* CopilotKit recibe el stream y usa el catálogo personalizado para renderizar un panel nativo e interactivo, perfectamente adaptado al contexto actual del laboratorio.

# Proyecto

Fablabos: Gestión Inteligente y Multitenencia para Laboratorios STEM

"Una plataforma tecnológica diseñada para laboratorios STEM que permite digitalizar, ordenar y sincronizar todo el proceso de gestión, desde la administración de proyectos y espacios de trabajo hasta el análisis de datos y la documentación científica." 

Fablabos es una plataforma de software como servicio diseñada para optimizar la gestión integral de laboratorios mediante una arquitectura personalizable de marca blanca. El sistema permite administrar múltiples espacios de trabajo y proyectos, integrando herramientas avanzadas como inteligencia artificial para mejorar el análisis de datos y la documentación. Su infraestructura técnica se apoya en el ecosistema dash-admin, utilizando tecnologías como Laravel y React en un setup que garantiza un rendimiento escalable en la nube. 

En conjunto, esta solución busca modernizar los entornos científicos de STEM proporcionando un control operativo multi-inquilino y multiplataforma. 

En términos sencillos, FabLab Os es una interfaz agencia, similar a [Notebook.lm](http://Notebook.lm) que permite a los usuarios a través de una interfaz reactiva, interactuar con la IA en un ambiente de espacios colaborativos enfocado en laboratorios.  
