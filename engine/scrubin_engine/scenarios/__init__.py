from .appendectomy import SCENARIO as APPENDECTOMY
from .cholecystectomy import SCENARIO as CHOLECYSTECTOMY
from .inguinal_hernia import SCENARIO as INGUINAL_HERNIA
from .sigmoid_colectomy import SCENARIO as SIGMOID_COLECTOMY
from .total_hysterectomy import SCENARIO as TOTAL_HYSTERECTOMY
from .radical_nephrectomy import SCENARIO as RADICAL_NEPHRECTOMY

SCENARIOS = {s["id"]: s for s in (APPENDECTOMY, CHOLECYSTECTOMY, INGUINAL_HERNIA, SIGMOID_COLECTOMY, TOTAL_HYSTERECTOMY, RADICAL_NEPHRECTOMY)}
