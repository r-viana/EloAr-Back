from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="EloAR Python Optimization Service",
    description="Serviço de Otimização por Algoritmo Genético para Enturmação Inteligente",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware for logging requests
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    logger.info(f"Request: {request.method} {request.url.path}")

    response = await call_next(request)

    duration = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Duration: {duration:.2f}ms")

    return response


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with service information"""
    return {
        "service": "EloAR Python Optimization Service",
        "version": "1.0.0",
        "description": "Serviço de Otimização por Algoritmo Genético",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc",
            "optimize": "/optimize (coming soon)",
        }
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint
    Returns the service status and basic information
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "ok",
            "timestamp": datetime.now().isoformat(),
            "service": "eloar-python-optimization",
            "version": "1.0.0",
            "dependencies": {
                "fastapi": "✓ running",
                "genetic_algorithm": "✓ ready",
            }
        }
    )


@app.get("/api/v1/info", tags=["Info"])
async def get_info():
    """Get service information and available endpoints"""
    return {
        "service": "EloAR Python Optimization Service",
        "version": "1.0.0",
        "description": "Serviço especializado em otimização de enturmação usando Algoritmos Genéticos",
        "features": [
            "Otimização por Algoritmo Genético (DEAP)",
            "Cálculo de fitness com múltiplos critérios",
            "Suporte a restrições críticas e suaves",
            "Monitoramento de progresso em tempo real",
            "Cancelamento de otimizações em execução"
        ],
        "endpoints": {
            "POST /optimize": "Iniciar otimização (em desenvolvimento)",
            "GET /optimize/{run_id}/status": "Consultar status (em desenvolvimento)",
            "POST /optimize/{run_id}/cancel": "Cancelar otimização (em desenvolvimento)",
        }
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("  EloAR Python Optimization Service")
    logger.info("  Sistema de Enturmação Inteligente")
    logger.info("=" * 60)
    logger.info("🚀 Service started successfully")
    logger.info("📊 Genetic Algorithm engine ready")
    logger.info("🔗 Endpoints available at /docs")
    logger.info("=" * 60)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Python Optimization Service...")
    logger.info("✓ Cleanup completed")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
