from .appendectomy import SCENARIO as APPENDECTOMY
from .cholecystectomy import SCENARIO as CHOLECYSTECTOMY

SCENARIOS = {s["id"]: s for s in (APPENDECTOMY, CHOLECYSTECTOMY)}
