### **PoC Técnico para A2UI, CopilotKit, AG-UI y MCP**

[![Demo en YouTube](https://img.youtube.com/vi/8tolfZjvtBQ/maxresdefault.jpg)](https://youtu.be/8tolfZjvtBQ)


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
