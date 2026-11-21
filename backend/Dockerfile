# Python 3.11 Slim Linux Base Image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies needed for compiling packages, psycopg2, and document processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Collect static files into staticfiles/
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start production server using Daphne (ASGI/WebSockets) or Gunicorn (WSGI)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "legal_doc_generator.asgi:application"]
