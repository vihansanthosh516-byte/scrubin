from .appendectomy import SCENARIO as APPENDECTOMY
from .cholecystectomy import SCENARIO as CHOLECYSTECTOMY
from .inguinal_hernia import SCENARIO as INGUINAL_HERNIA

SCENARIOS = {s["id"]: s for s in (APPENDECTOMY, CHOLECYSTECTOMY, INGUINAL_HERNIA)}
