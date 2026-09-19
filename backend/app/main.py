from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException

from app.config import settings
from app.routers import medicines, inventory, sales, analytics, catalog

app = FastAPI(
    title="MEDIX API",
    description="Smart Pharmacy Store Management & Intelligence System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    # Normalizes every error to {success, message, details} as specced
    if isinstance(exc.detail, dict):
        body = exc.detail
    else:
        body = {"success": False, "message": str(exc.detail)}
    return JSONResponse(status_code=exc.status_code, content=body)


app.include_router(medicines.router)
app.include_router(inventory.router)
app.include_router(sales.router)
app.include_router(analytics.router)
app.include_router(catalog.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "MEDIX API"}
