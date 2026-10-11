from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from ..api.session_manager import SessionManager
from ..api.persistent_session_store import PersistentSessionStore, SessionMetadata
from ..api.api_contracts import (
    SimulationCreateRequest,
    SimulationCreateResponse,
    SimulationActionRequest,
    SimulationActionResponse,
    SimulationStateResponse,
)

from . import dependency_provider as dp
from .error_models import (
    ValidationError,
    SessionNotFoundError,
    PersistenceError,
    AuthorizationError,
)
from ..auth.user import UserIdentity
from ..auth.dependencies import get_current_user

router = APIRouter()

# ---------------------------------------------------------------------------
# Phase 3 – Procedure catalog and session start with procedure_id
# ---------------------------------------------------------------------------

@router.get("/procedures")
def list_procedures_endpoint():
    """Return a list of available procedures (id and name)."""
    from scrubin.procedures.registry import list_procedures
    procs = list_procedures()
    # Simplify to id/name for API consumers
    return [{"id": pid, "name": proc.get("name", proc.get("title", pid))} for pid, proc in procs.items()]

# Extend the create request model to accept optional procedure_id and other metadata.

@router.post("/session/start", response_model=SimulationCreateResponse)
def session_start(
    req: ExtendedCreateRequestModel,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
):
    """Start a new session optionally bound to a procedure.

    Currently the procedure_id is stored in the world metadata for later use.
    """
    internal_req = SimulationCreateRequest(seed=req.seed, initial_tick=req.initial_tick)
    resp = manager.create_session(internal_req, user.user_id)
    # If a procedure_id is provided, attach it to the newly created world state.
    if req.procedure_id:
        from scrubin.world.state import WorldState
        world = manager._sessions[resp.session_id]
        # Store procedure_id in a generic metadata dict on WorldState (add if missing).
        if not hasattr(world, "metadata"):
            # Extend WorldState with a simple dict via replacement (immutably).
            world = world.with_metadata({"procedure_id": req.procedure_id})
        else:
            md = dict(world.metadata)
            md["procedure_id"] = req.procedure_id
            world = world.with_metadata(md)
        manager._sessions[resp.session_id] = world
    return jsonable_encoder(resp)


def _ensure_owner(user: UserIdentity, session_id: str, manager: SessionManager, store: PersistentSessionStore) -> None:
    # Check in manager's in-memory ownership mapping first.
    owners = getattr(manager, "_owners", {})
    if session_id in owners:
        if owners[session_id] != user.user_id:
            raise AuthorizationError(message="Forbidden: session not owned by user", code=403)
        return
    # Fallback to persisted metadata.
    try:
        meta = store.get_metadata(session_id)
    except FileNotFoundError:
        raise SessionNotFoundError(message=f"Session {session_id} not found", code=404)
    if meta.owner_user_id != user.user_id:
        raise AuthorizationError(message="Forbidden: session not owned by user", code=403)

# ---------------------------------------------------------------------------
# Pydantic request models – thin wrappers around the internal dataclasses.
# ---------------------------------------------------------------------------
class CreateRequestModel(BaseModel):
    seed: int = Field(..., description="Deterministic RNG seed for the session")
    initial_tick: int = Field(0, description="Starting simulation tick")

# Extended model for Phase 3 session start with additional metadata.
class ExtendedCreateRequestModel(CreateRequestModel):
    profile: str = Field("default", description="User profile configuration")
    patient_profile: str = Field("standard", description="Patient profile selection")
    mode: str = Field("interactive", description="Simulation mode")
    procedure_id: str | None = Field(None, description="Procedure identifier to load")

class ActionRequestModel(BaseModel):
    action_type: str = Field(..., description="High‑level deterministic action identifier")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Action‑specific parameters")
    timestamp: int = Field(0, description="Logical tick at which the action is issued")

# ---------------------------------------------------------------------------
# Endpoint implementations
# ---------------------------------------------------------------------------
@router.post("/session/create", response_model=SimulationCreateResponse)
def create_session(
    req: CreateRequestModel,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
):
    # Convert to internal contract and delegate.
    internal_req = SimulationCreateRequest(seed=req.seed, initial_tick=req.initial_tick)
    resp = manager.create_session(internal_req, user.user_id)
    return jsonable_encoder(resp)

@router.get("/session/{session_id}/state", response_model=SimulationStateResponse)
def get_state(
    session_id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    _ensure_owner(user, session_id, manager, store)
    try:
        resp = manager.get_state(session_id)
    except KeyError as exc:
        raise SessionNotFoundError(message=str(exc), code=404)
    return jsonable_encoder(resp)

@router.post("/session/{session_id}/action", response_model=SimulationActionResponse)
def post_action(
    session_id: str,
    req: ActionRequestModel,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    # Build internal request; session_id is derived from path.
    internal_req = SimulationActionRequest(
        session_id=session_id,
        action_type=req.action_type,
        parameters=req.parameters,
        timestamp=req.timestamp,
    )
    _ensure_owner(user, session_id, manager, store)
    try:
        resp = manager.apply_action(internal_req)
    except KeyError as exc:
        raise SessionNotFoundError(message=str(exc), code=404)
    return jsonable_encoder(resp)

@router.post("/session/{session_id}/save")
def save_session(
    session_id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    _ensure_owner(user, session_id, manager, store)
    try:
        world_state = manager.get_state(session_id).current_world_state
        metadata = store.save_session(session_id, world_state, user.user_id)
    except FileNotFoundError:
        metadata = store.create_session(session_id, world_state, user.user_id)
    except KeyError as exc:
        raise SessionNotFoundError(message=str(exc), code=404)
    except Exception as exc:
        raise PersistenceError(message=str(exc), code=500)
    return jsonable_encoder({"metadata": metadata})

@router.post("/session/{session_id}/load")
def load_session(
    session_id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    _ensure_owner(user, session_id, manager, store)
    try:
        world, meta = store.load_session(session_id)
        manager.set_state(session_id, world, owner_user_id=user.user_id)
    except FileNotFoundError as exc:
        raise SessionNotFoundError(message=str(exc), code=404)
    except Exception as exc:
        raise PersistenceError(message=str(exc), code=500)
    resp = manager.get_state(session_id)
    return jsonable_encoder({"metadata": meta, "state": resp})

@router.delete("/session/{session_id}")
def delete_session(
    session_id: str,
    user: UserIdentity = Depends(get_current_user),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
):
    _ensure_owner(user, session_id, manager, store)
    try:
        store.delete_session(session_id)
        try:
            manager.delete_session(session_id)
        except Exception:
            pass
    except FileNotFoundError as exc:
        raise SessionNotFoundError(message=str(exc), code=404)
    except Exception as exc:
        raise PersistenceError(message=str(exc), code=500)
    return {"detail": f"Session {session_id} deleted"}



# ---------------------------------------------------------------------------
# Phase 2 API contract aliases
# ---------------------------------------------------------------------------

@router.post("/simulation/start", response_model=SimulationCreateResponse)
def simulation_start(
    req: CreateRequestModel,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
):
    """Alias for creating a simulation session (POST /simulation/start)."""
    internal_req = SimulationCreateRequest(seed=req.seed, initial_tick=req.initial_tick)
    resp = manager.create_session(internal_req, user.user_id)
    return jsonable_encoder(resp)

@router.post("/simulation/{id}/decision", response_model=SimulationActionResponse)
def simulation_decision(
    id: str,
    req: ActionRequestModel,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    """Alias for applying an action (POST /simulation/{id}/decision)."""
    internal_req = SimulationActionRequest(
        session_id=id,
        action_type=req.action_type,
        parameters=req.parameters,
        timestamp=req.timestamp,
    )
    _ensure_owner(user, id, manager, store)
    resp = manager.apply_action(internal_req)
    return jsonable_encoder(resp)

@router.get("/simulation/{id}/state", response_model=SimulationStateResponse)
def simulation_state(
    id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    """Alias for retrieving simulation state (GET /simulation/{id}/state)."""
    _ensure_owner(user, id, manager, store)
    resp = manager.get_state(id)
    return jsonable_encoder(resp)

# Additional GET endpoints (timeline, evaluation, replay, etc.) can reuse the same state response
# for now, exposing the same SimulationStateResponse.

@router.get("/simulation/{id}/timeline", response_model=SimulationStateResponse)
def simulation_timeline(id: str, user: UserIdentity = Depends(get_current_user), manager: SessionManager = Depends(lambda: dp.get_session_manager()), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    _ensure_owner(user, id, manager, store)
    resp = manager.get_state(id)
    return jsonable_encoder(resp)

@router.get("/simulation/{id}/evaluation", response_model=SimulationStateResponse)
def simulation_evaluation(id: str, user: UserIdentity = Depends(get_current_user), manager: SessionManager = Depends(lambda: dp.get_session_manager()), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    _ensure_owner(user, id, manager, store)
    resp = manager.get_state(id)
    return jsonable_encoder(resp)

@router.get("/simulation/{id}/replay", response_model=SimulationStateResponse)
def simulation_replay(id: str, user: UserIdentity = Depends(get_current_user), manager: SessionManager = Depends(lambda: dp.get_session_manager()), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    _ensure_owner(user, id, manager, store)
    resp = manager.get_state(id)
    return jsonable_encoder(resp)

@router.post("/simulation/save")
def simulation_save(
    id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    _ensure_owner(user, id, manager, store)
    world_state = manager.get_state(id).current_world_state
    try:
        metadata = store.save_session(id, world_state, user.user_id)
    except FileNotFoundError:
        metadata = store.create_session(id, world_state, user.user_id)
    return jsonable_encoder({"metadata": metadata})

@router.get("/simulation/load")
def simulation_load(
    id: str,
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    _ensure_owner(user, id, manager, store)
    world, meta = store.load_session(id)
    manager.set_state(id, world, owner_user_id=user.user_id)
    resp = manager.get_state(id)
    return jsonable_encoder({"metadata": meta, "state": resp})

@router.get("/procedure/{id}")
def get_procedure(id: str):
    # Placeholder – actual procedure registry lookup not yet implemented.
    return {"procedure_id": id, "detail": "Not implemented"}

@router.get("/search")
def search():
    return {"msg": "Search endpoint placeholder"}

@router.get("/leaderboard")
def leaderboard():
    return {"msg": "Leaderboard placeholder"}

@router.get("/learn")
def learn():
    return {"msg": "Learn placeholder"}

@router.get("/user/profile")
def user_profile(user: UserIdentity = Depends(get_current_user)):
    return {"user_id": user.user_id, "profile": "Placeholder"}

@router.get("/user/history")
def user_history(user: UserIdentity = Depends(get_current_user)):
    return {"user_id": user.user_id, "history": []}

@router.get("/sessions", response_model=List[str])
def list_sessions(
    user: UserIdentity = Depends(get_current_user),
    manager: SessionManager = Depends(lambda: dp.get_session_manager()),
    store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store()),
):
    # Combine in‑memory sessions owned by the user with persisted sessions.
    in_memory_ids = [sid for sid, owner in getattr(manager, "_owners", {}).items() if owner == user.user_id]
    persisted_ids = []
    try:
        persisted_ids = store.list_sessions_for_user(user.user_id)
    except Exception as exc:
        raise PersistenceError(message=str(exc), code=500)
    # Deduplicate while preserving order via set.
    ids = sorted(set(in_memory_ids + persisted_ids))
    return ids

# ---------------------------------------------------------------------------
# Misc endpoints – health & readiness
# ---------------------------------------------------------------------------

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/ready")
def ready():
    return {"status": "ready"}

# ---------------------------------------------------------------------------
# Phase 12 – Database persistence endpoints (placeholders)
# ---------------------------------------------------------------------------

@router.get("/database/simulations")
def list_simulations(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of saved simulation metadata for the user."""
    try:
        sessions = store.list_sessions_for_user(user.user_id)
    except Exception as exc:
        raise PersistenceError(message=str(exc), code=500)
    return {"simulations": sessions}

@router.get("/database/replay")
def list_replays(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of saved replay metadata for the user (placeholder)."""
    # Assuming replay metadata stored similarly; return empty list for now.
    return {"replays": []}

@router.get("/database/debrief")
def list_debriefs(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of saved debrief metadata for the user (placeholder)."""
    return {"debriefs": []}

@router.get("/database/xp")
def list_xp(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of saved experience points data for the user (placeholder)."""
    return {"xp": []}

@router.get("/database/badges")
def list_badges(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of earned badges for the user (placeholder)."""
    return {"badges": []}

@router.get("/database/history")
def list_history(user: UserIdentity = Depends(get_current_user), store: PersistentSessionStore = Depends(lambda: dp.get_persistent_store())):
    """Return a list of session history entries for the user (placeholder)."""
    return {"history": []}


# ---------------------------------------------------------------------------
# Exception handlers – translate custom error models to HTTP responses.
# ---------------------------------------------------------------------------
