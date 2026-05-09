FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY pyproject.toml uv.lock ./

# Install dependencies into the project venv (lock file is committed)
RUN uv sync --frozen --no-install-project

# Copy the rest of the agent code
COPY . .

# Install the project itself
RUN uv sync

EXPOSE 8001

CMD ["uv", "run", "python", "main.py"]
