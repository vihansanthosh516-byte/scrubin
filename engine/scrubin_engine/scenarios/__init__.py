from .appendectomy import SCENARIO as APPENDECTOMY
from .cholecystectomy import SCENARIO as CHOLECYSTECTOMY
from .inguinal_hernia import SCENARIO as INGUINAL_HERNIA
from .sigmoid_colectomy import SCENARIO as SIGMOID_COLECTOMY

SCENARIOS = {s["id"]: s for s in (APPENDECTOMY, CHOLECYSTECTOMY, INGUINAL_HERNIA, SIGMOID_COLECTOMY)}
