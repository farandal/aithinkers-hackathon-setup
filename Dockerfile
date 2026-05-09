# Imagen base con Node y Python
FROM node:20-bullseye

# Instalar Python y uv
RUN apt-get update && apt-get install -y python3 python3-pip curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios de trabajo
WORKDIR /workspace

# Instalar CopilotKit CLI globalmente
#RUN npm install -g cpk-cli@latest

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias del frontend
WORKDIR /workspace/frontend
RUN npm install

# Instalar dependencias del agente (Python)
WORKDIR /workspace/agent
RUN uv pip install -r requirements.txt

# Volver al workspace
WORKDIR /workspace

# Exponer puertos
EXPOSE 3000

# Comando por defecto: iniciar frontend + backend
CMD ["npm", "run", "dev", "--prefix", "frontend"]

