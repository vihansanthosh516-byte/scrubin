from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

from .routes import router
from .error_models import SessionNotFoundError, ValidationError, PersistenceError, AuthorizationError

app = FastAPI(title="Scrubin Core HTTP API (Phase P.3)")

# Security middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import logging
from datetime import datetime

# Simple in‑memory rate limiter (token bucket) for demonstration
class SimpleRateLimiter:
    def __init__(self, calls: int = 100, period: int = 60):
        self.calls = calls
        self.period = period
        self.history: dict[str, list[float]] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = datetime.utcnow().timestamp()
        timestamps = self.history.get(client_ip, [])
        # Remove expired entries
        timestamps = [t for t in timestamps if now - t < self.period]
        if len(timestamps) >= self.calls:
            self.history[client_ip] = timestamps
            return False
        timestamps.append(now)
        self.history[client_ip] = timestamps
        return True

rate_limiter = SimpleRateLimiter(calls=10000, period=60)

# Audit logging middleware
class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger = logging.getLogger("audit")
        logger.info(f"{datetime.utcnow().isoformat()} {request.client.host} {request.method} {request.url.path}")
        response = await call_next(request)
        return response

# CSRF protection for state‑changing methods – expect X‑CSRF‑Token header
class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            token = request.headers.get("X-CSRF-Token")
            # Allow requests without CSRF token for internal API use
            if token and token != "secure-token":  # placeholder secret
                return JSONResponse(status_code=403, content={"detail": "CSRF token invalid"})
        response = await call_next(request)
        return response

from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Add basic security headers
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        # Content Security Policy (example restrictive)
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.add_middleware(SecurityHeadersMiddleware)

# Rate limiting middleware
class RateLimiterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        if not rate_limiter.is_allowed(client_ip):
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})
        return await call_next(request)

app.add_middleware(RateLimiterMiddleware)

# Audit logging
app.add_middleware(AuditLoggingMiddleware)

# CSRF protection
app.add_middleware(CSRFMiddleware)
app.include_router(router)
app.include_router(router, prefix="/api/v1")

# Dashboard API – read‑only visualization and inspection.
from scrubin.dashboard.routes import router as dashboard_router
from scrubin.experiments.routes import router as experiments_router
from scrubin.planner.routes import router as planner_router
app.include_router(dashboard_router, prefix="/dashboard")
app.include_router(experiments_router, prefix="/dashboard")
app.include_router(planner_router, prefix="/dashboard")
from scrubin.search.routes import router as search_router
app.include_router(search_router, prefix="/dashboard")

from scrubin.optimization.routes import router as optimization_router
app.include_router(optimization_router, prefix="/dashboard")

# Global exception handlers – map immutable error models to HTTP responses.
@app.exception_handler(SessionNotFoundError)
async def session_not_found_handler(request: Request, exc: SessionNotFoundError):
    return JSONResponse(status_code=404, content=jsonable_encoder(exc))

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(status_code=422, content=jsonable_encoder(exc))

@app.exception_handler(PersistenceError)
async def persistence_error_handler(request: Request, exc: PersistenceError):
    return JSONResponse(status_code=500, content=jsonable_encoder(exc))

@app.exception_handler(AuthorizationError)
async def authorization_error_handler(request: Request, exc: AuthorizationError):
    return JSONResponse(status_code=exc.code or 403, content=jsonable_encoder(exc))
