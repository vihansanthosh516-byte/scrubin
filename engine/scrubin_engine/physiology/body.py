"""Lumped cardiovascular + respiratory + gas-exchange physiology.

Cardiovascular:  MAP = CO x SVR + CVP,  CO = HR x SV
  SV follows a Frank-Starling curve on effective preload (blood volume minus
  venodilation, caval compression from pneumoperitoneum, positioning,
  positive-pressure ventilation), scaled by contractility and afterload.
  HR and SVR are driven by sympathetic tone (awake stress, noxious stimuli,
  chemoreflex) and a baroreflex whose gain anesthetics blunt.

Respiratory / gas exchange:
  CO2  - single body store; PaCO2 rises ~3-4 mmHg/min in apnea.
  O2   - lung O2 store (FRC x FAO2) exchanging with a venous blood pool;
         end-capillary saturation from the Severinghaus equation, arterial
         content mixes shunted venous blood. This reproduces preoxygenation,
         apneic desaturation curves (faster with obesity, fever, low FRC) and
         apneic oxygenation.

All relationships are expressed relative to the patient's awake baseline so
the model is self-calibrating for any PatientSpec.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from math import exp

from ..patient import PatientSpec
from .pharmacology import Effects, hill

P_DRY = 713.0  # 760 - 47 mmHg water vapour
CVP = 5.0


def sat_from_po2(po2: float) -> float:
    """Severinghaus 1979."""
    po2 = max(0.1, po2)
    return 1.0 / (23400.0 / (po2**3 + 150.0 * po2) + 1.0)


def po2_from_sat(s: float) -> float:
    s = min(0.99999, max(1e-4, s))
    lo, hi = 0.1, 700.0
    for _ in range(40):
        mid = 0.5 * (lo + hi)
        if sat_from_po2(mid) < s:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def o2_content(hb: float, sat: float, po2: float) -> float:
    """ml O2 per dL blood."""
    return 1.34 * hb * sat + 0.003 * po2


def po2_from_content(ca: float, hb: float) -> float:
    lo, hi = 0.1, 700.0
    for _ in range(40):
        mid = 0.5 * (lo + hi)
        if o2_content(hb, sat_from_po2(mid), mid) < ca:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


@dataclass
class Ventilation:
    """What actually reaches the alveoli this step (computed by the airway)."""

    va_l_min: float = 0.0  # alveolar ventilation
    ve_l_min: float = 0.0  # minute ventilation (for display)
    rr: float = 0.0
    tv_ml: float = 0.0
    fio2: float = 0.21  # inspired O2 fraction reaching the alveoli
    airway_open_to_o2: bool = False  # apneic oxygenation possible
    source_fio2: float = 0.21
    mean_paw: float = 0.0  # cmH2O, positive-pressure ventilation
    peep: float = 0.0
    extra_shunt: float = 0.0
    spontaneous: bool = True


@dataclass
class SurgicalLoad:
    """Inputs from the operative field (filled by the surgery module)."""

    iap_mmhg: float = 0.0  # intra-abdominal (insufflation) pressure
    trendelenburg_deg: float = 0.0  # + head down, - head up
    lateral_flank: bool = False  # lateral decubitus with the flank broken
    stimulus: float = 0.0  # noxious intensity 0..1
    vagal_stimulus: float = 0.0  # peritoneal stretch etc.
    bleeding_ml_min: float = 0.0
    co2_absorption_ml_min: float = 0.0
    warming: bool = False


@dataclass
class Body:
    patient: PatientSpec
    # --- state ----------------------------------------------------------
    blood_volume: float = field(init=False)
    red_cell_volume: float = field(init=False)
    crystalloid_excess: float = 0.0
    refilled_ml: float = 0.0
    paco2: float = 38.0
    lung_o2_ml: float = field(init=False)
    cvo2: float = field(init=False)  # mixed venous O2 content ml/dL
    shunt: float = field(init=False)
    frc: float = field(init=False)
    temp: float = field(init=False)
    symp_stim: float = 0.0  # acute sympathetic response to noxious stimuli
    baro_hr: float = 0.0
    baro_svr: float = 0.0
    ischemia: float = 0.0  # myocardial O2 debt 0..1+
    o2_debt_ml: float = 0.0
    rhythm: str = "sinus"
    cpr: bool = False
    rosc_progress: float = 0.0
    stomach_air_ml: float = 0.0
    # --- derived outputs (last step) -------------------------------------
    hr: float = field(init=False)
    sv: float = field(init=False)
    co: float = field(init=False)
    svr: float = field(init=False)
    map: float = field(init=False)
    sbp: float = field(init=False)
    dbp: float = field(init=False)
    pao2: float = 95.0
    sao2: float = 0.97
    etco2: float = 35.0
    spont_ve: float = 0.0
    spont_rr: float = 0.0
    vo2_actual: float = 0.0
    fluids_in_ml: float = 0.0
    blood_loss_ml: float = 0.0
    urine_ml: float = 0.0
    movement: float = 0.0  # patient moving/coughing in response to stimulus

    def __post_init__(self) -> None:
        p = self.patient
        self.bv0 = p.blood_volume_ml
        self.blood_volume = self.bv0
        self.red_cell_volume = self.bv0 * p.hb_g_dl * 3.0 / 100.0
        self.temp = p.temp_c
        self.hr0 = p.hr
        self.map0 = p.map
        self.pp0 = p.sbp - p.dbp
        # Cardiac index ~3.2 awake (higher with fever), BSA via Mosteller.
        bsa = (p.height_cm * p.weight_kg / 3600.0) ** 0.5
        self.co0 = 3.2 * bsa * (1.0 + 0.08 * max(0.0, p.temp_c - 37.0))
        self.sv0 = self.co0 * 1000.0 / self.hr0
        self.svr0 = (self.map0 - CVP) / self.co0
        self.hr, self.sv, self.co, self.svr = self.hr0, self.sv0, self.co0, self.svr0
        self.map, self.sbp, self.dbp = self.map0, p.sbp, p.dbp
        # Respiratory baseline.
        self.frc0 = p.frc_ml
        self.frc = self.frc0
        self.shunt0 = 0.03 + 0.004 * max(0.0, p.bmi - 25.0)
        self.shunt = self.shunt0
        self.vd_anat = 2.2 * p.ibw_kg
        self.vco2_0 = 0.8 * p.vo2_ml_min
        self.paco2 = 38.0
        self.paco2_set = 38.0
        self.va0 = 863.0 * self.vco2_0 / 1000.0 / self.paco2
        self.rr0 = p.rr
        self.ve0 = self.va0 + self.vd_anat * self.rr0 / 1000.0
        # Awake-stress sympathetic tone present at baseline.
        self.s_awake0 = 0.12
        self.vagal0 = 0.15
        self.temp0 = p.temp_c
        # Initial gas stores at room air steady state.
        fao2 = 0.21 - p.vo2_ml_min / 1000.0 / self.va0
        self.lung_o2_ml = self.frc * fao2
        pao2 = fao2 * P_DRY
        sc = sat_from_po2(pao2)
        cc = o2_content(p.hb_g_dl, sc, pao2)
        # Venous content from Fick: CvO2 = CaO2 - VO2/CO (iterate a bit for shunt).
        cv = cc - p.vo2_ml_min / (self.co0 * 10.0)
        for _ in range(5):
            ca = (1 - self.shunt) * cc + self.shunt * cv
            cv = ca - p.vo2_ml_min / (self.co0 * 10.0)
        self.cvo2 = cv
        ca = (1 - self.shunt) * cc + self.shunt * cv
        self.pao2 = po2_from_content(ca, p.hb_g_dl)
        self.sao2 = sat_from_po2(self.pao2)
        self.etco2 = self.paco2 - 3.0

    # ------------------------------------------------------------------
    @property
    def hb(self) -> float:
        return self.red_cell_volume / self.blood_volume * 100.0 / 3.0

    @property
    def co_ratio(self) -> float:
        return self.co / self.co0

    def spontaneous_drive(self, eff: Effects) -> tuple[float, float]:
        """Spontaneous minute ventilation (L/min) and rate the patient would generate."""
        if self.rhythm in ("pea", "asystole", "vf"):
            return 0.0, 0.0
        chemo = max(0.0, 1.0 + 0.25 * (self.paco2 - self.paco2_set))
        arousal = max(0.0, min(1.0, (eff.bis - 40.0) / 57.0))
        if self.pao2 < 60:
            chemo *= 1.0 + 0.03 * (60.0 - self.pao2) * (0.3 + 0.7 * arousal)
        factor = eff.resp_factor
        if factor < 0.07:
            return 0.0, 0.0  # apnea
        ve = self.ve0 * chemo * factor * (1.0 - eff.diaphragm_block)
        ve = min(ve, 4.0 * self.ve0)
        opi = hill(eff.opioid_eq, 2.0, 1.6)
        rr = self.rr0 * max(0.3, (ve / self.ve0) ** 0.5) * (1.0 - 0.5 * opi)
        if ve < 0.3:
            return 0.0, 0.0
        return ve, max(3.0, min(45.0, rr))

    # ------------------------------------------------------------------
    def step(self, dt_s: float, eff: Effects, vent: Ventilation, load: SurgicalLoad, stim_response: float) -> None:
        dt = dt_s / 60.0
        p = self.patient

        # ---------------- volumes -------------------------------------
        if load.bleeding_ml_min > 0:
            loss = load.bleeding_ml_min * dt
            frac = loss / self.blood_volume
            self.red_cell_volume -= self.red_cell_volume * frac
            self.blood_volume -= loss
            self.blood_loss_ml += loss
        # Transcapillary refill after blood loss (autotransfusion), capped.
        if self.blood_volume < self.bv0 and self.refilled_ml < 1000.0:
            refill = (self.bv0 - self.blood_volume) * 0.01 * dt
            self.blood_volume += refill
            self.refilled_ml += refill
        leak = self.crystalloid_excess * (1.0 - exp(-dt / 20.0))
        self.crystalloid_excess -= leak
        self.blood_volume -= leak
        self.blood_volume = max(0.3 * self.bv0, self.blood_volume)
        # Urine: ~0.5-1 ml/kg/h when perfused.
        self.urine_ml += max(0.0, 1.0 * p.weight_kg / 60.0 * min(1.2, self.map / 65.0 - 0.3)) * dt

        # ---------------- autonomic -----------------------------------
        arousal = max(0.0, min(1.0, (eff.bis - 40.0) / 57.0))
        pain = 1.0 - hill(eff.opioid_eq, 1.5)
        s_awake = self.s_awake0 * arousal * (0.5 + 0.5 * pain)
        # Acute sympathetic response: fast rise, slower decay.
        target = stim_response
        tau = 8.0 if target > self.symp_stim else 60.0
        self.symp_stim += (target - self.symp_stim) * (1.0 - exp(-dt_s / tau))
        chemo_symp = 0.012 * max(0.0, self.paco2 - 50.0) + 0.01 * max(0.0, 60.0 - self.pao2) * (1 if self.pao2 > 35 else 0.3)
        self.movement = stim_response * eff.nmb_t1

        # Baroreflex (blunted by anesthetics).
        # Anesthetics reset the baroreflex set point downward.
        map_set = self.map0 * (1.0 - 0.22 * (1.0 - arousal))
        err = (map_set - self.map) / map_set
        err = max(-0.4, min(0.6, err))
        g = eff.baro_gain
        self.baro_hr += (1.6 * g * err - self.baro_hr) * (1.0 - exp(-dt_s / 6.0))
        self.baro_svr += (0.9 * g * err - self.baro_svr) * (1.0 - exp(-dt_s / 20.0))

        # Temperature.
        if eff.bis < 65:
            self.temp -= (0.9 if not load.warming else -0.2) / 60.0 * dt
        temp_f = (1.0 + 0.1 * (self.temp - 37.0)) / (1.0 + 0.1 * (self.temp0 - 37.0))

        # ---------------- heart rate ----------------------------------
        s_hr = s_awake + 0.55 * self.symp_stim + max(-0.35, self.baro_hr) + chemo_symp
        vagal = self.vagal0 * (1.0 - eff.vagal_block) + eff.vagal_add
        vagal += 0.45 * load.vagal_stimulus * (1.0 - eff.vagal_block) * (1.3 if eff.bis > 60 else 1.0)
        vagal = min(0.85, vagal)
        hr = self.hr0 * (1 + s_hr) / (1 + self.s_awake0) * (1 - vagal) / (1 - self.vagal0) * eff.hr_factor * temp_f
        # Hypoxic myocardium: bradycardia then arrest.
        if self.sao2 < 0.65 or self.map < 40:
            severity = max((0.65 - self.sao2) / 0.3, (40 - self.map) / 20)
            self.ischemia += 0.012 * max(0.0, severity) * dt_s
        else:
            self.ischemia = max(0.0, self.ischemia - 0.01 * dt_s)
        hr *= max(0.3, 1.0 - 0.6 * self.ischemia)
        hr = max(20.0, min(210.0, hr))

        # ---------------- SVR -----------------------------------------
        s_svr = 0.8 * s_awake + 0.45 * self.symp_stim + max(-0.3, self.baro_svr) + 0.8 * chemo_symp
        iap_svr = 1.0 + 0.018 * max(0.0, load.iap_mmhg)
        acid = 1.0 - 0.004 * max(0.0, self.paco2 - 70.0)
        svr = self.svr0 * (1 + s_svr) / (1 + 0.8 * self.s_awake0) * eff.svr_factor * iap_svr * acid

        # ---------------- stroke volume -------------------------------
        bv_eff = self.blood_volume * (1.0 - max(-0.1, eff.venodilation))
        preload = 1.0 - 1.4 * (1.0 - bv_eff / self.bv0)
        preload -= 0.012 * max(0.0, load.iap_mmhg - 8.0)  # caval compression
        preload += 0.006 * load.trendelenburg_deg  # head-down improves, head-up reduces
        preload -= 0.01 * max(0.0, vent.mean_paw - 5.0)
        preload -= 0.05 if load.lateral_flank else 0.0  # kidney rest compresses the vena cava
        preload += 0.08 * s_svr  # venoconstriction mobilises stressed volume
        preload = max(0.05, preload)
        starling = preload if preload < 1.0 else 1.0 + 0.3 * (1.0 - exp(-(preload - 1.0) / 0.3))
        contract = eff.contractility * (1.0 + 0.35 * (s_hr * 0.5 + 0.5 * self.symp_stim)) * max(0.1, 1.0 - self.ischemia)
        contract *= 1.0 - 0.003 * max(0.0, self.paco2 - 70.0)
        afterload = (self.svr0 / svr) ** 0.25
        fill = max(0.45, 1.0 - max(0.0, hr - 140.0) / 140.0)
        sv = self.sv0 * starling * contract * afterload * fill

        # ---------------- rhythm / arrest -----------------------------
        if self.rhythm in ("pea", "asystole", "vf"):
            if self.cpr:
                co = 0.25 * self.co0
            else:
                co = 0.0
            sv = 0.0
            if self.rhythm == "vf":
                hr = 0.0
        else:
            co = hr * sv / 1000.0
            if self.ischemia > 1.0:
                self.rhythm = "pea" if self.ischemia < 1.4 else "asystole"
                co = 0.0
            elif hr < 50:
                self.rhythm = "sinus_brady"
            elif hr > 100:
                self.rhythm = "sinus_tach"
            else:
                self.rhythm = "sinus"
        mapv = co * svr + CVP if co > 0 else (CVP + (0.25 * self.co0 * svr * 0.6 if self.cpr else 3.0))
        pp = self.pp0 * (sv / self.sv0) * (0.8 + 0.2 * svr / self.svr0) if sv > 0 else (25.0 if self.cpr else 0.0)
        self.hr, self.sv, self.co, self.svr, self.map = hr, sv, co, svr, mapv
        self.sbp = mapv + 2.0 * pp / 3.0
        self.dbp = max(0.0, mapv - pp / 3.0)

        # ---------------- lungs ---------------------------------------
        anesthetized = eff.bis < 65
        frc_target = self.frc0 * (0.8 if anesthetized else 1.0)
        frc_target *= 1.0 - 0.012 * max(0.0, load.iap_mmhg)
        frc_target *= 1.0 + 0.004 * -load.trendelenburg_deg if load.trendelenburg_deg < 0 else 1.0 - 0.006 * load.trendelenburg_deg
        frc_target *= 1.0 + 0.03 * vent.peep
        old_frc = self.frc
        self.frc += (frc_target - self.frc) * (1.0 - exp(-dt_s / 90.0))
        dv = self.frc - old_frc
        if dv < 0:
            self.lung_o2_ml *= self.frc / old_frc  # gas leaves at alveolar composition
        elif vent.va_l_min > 0 or vent.airway_open_to_o2:
            self.lung_o2_ml += dv * vent.fio2
        obese = max(0.0, p.bmi - 25.0)
        shunt_target = self.shunt0
        if anesthetized:
            shunt_target += (0.05 + 0.006 * obese) * max(0.2, 1.0 - 0.09 * vent.peep)
        shunt_target += 0.004 * max(0.0, load.iap_mmhg - 8.0)
        shunt_target += 0.03 if load.lateral_flank else 0.0  # dependent lung
        shunt_target += 0.0015 * max(0.0, load.trendelenburg_deg - 15.0)  # steep head-down
        shunt_target += vent.extra_shunt
        self.shunt += (min(0.6, shunt_target) - self.shunt) * (1.0 - exp(-dt_s / 60.0))

        # Metabolism falls ~15% under general anesthesia, rises with fever.
        vo2 = p.vo2_ml_min * (0.85 if anesthetized else 1.0) * (1.0 + 0.1 * (self.temp - self.temp0))
        vco2 = 0.8 * vo2 + load.co2_absorption_ml_min

        # CO2 store.
        c_co2 = 0.05 * (p.weight_kg / 70.0)  # L per mmHg
        elim = vent.va_l_min * self.paco2 / 863.0
        self.paco2 += (vco2 / 1000.0 - elim) / c_co2 * dt
        self.paco2 = max(10.0, min(180.0, self.paco2))

        # O2: lung store <-> blood.
        hb = self.hb
        fao2 = max(0.0, self.lung_o2_ml / max(300.0, self.frc))
        pao2_alv = fao2 * P_DRY
        sc = sat_from_po2(pao2_alv)
        cc = o2_content(hb, sc, pao2_alv)
        q = max(0.0, co) * 10.0  # dL/min
        uptake = q * (1.0 - self.shunt) * (cc - self.cvo2)
        if vent.va_l_min > 0:
            flux = vent.va_l_min * 1000.0 * (vent.fio2 - fao2)
        elif vent.airway_open_to_o2:
            flux = max(0.0, uptake) * vent.source_fio2 * 0.9  # mass-flow apneic oxygenation
        else:
            flux = 0.0
        self.lung_o2_ml += (flux - uptake) * dt
        self.lung_o2_ml = max(0.0, min(self.frc * 1.0, self.lung_o2_ml))
        ca = (1.0 - self.shunt) * cc + self.shunt * self.cvo2
        # Tissue extraction falls off as venous O2 approaches its floor.
        v_venous_dl = 0.7 * self.blood_volume / 100.0
        vo2_actual = vo2 if self.cvo2 > 3.0 else vo2 * max(0.0, (self.cvo2 - 1.5) / 1.5)
        self.vo2_actual = vo2_actual
        self.o2_debt_ml += max(0.0, vo2 - vo2_actual) * dt
        self.cvo2 += (q * (ca - self.cvo2) - vo2_actual) / v_venous_dl * dt
        self.cvo2 = max(0.5, self.cvo2)
        self.pao2 = po2_from_content(ca, hb)
        self.sao2 = sat_from_po2(self.pao2)

        # End-tidal CO2 needs exhaled alveolar gas and pulmonary perfusion.
        perfusion = min(1.0, max(0.0, co / (0.6 * self.co0)))
        gradient = 3.0 + 25.0 * (1.0 - perfusion)
        self.etco2 = max(0.0, (self.paco2 - gradient) * (0.3 + 0.7 * perfusion))

        # ---------------- CPR / ROSC ----------------------------------
        if self.rhythm in ("pea", "asystole", "vf") and self.cpr:
            if self.sao2 > 0.85 and self.paco2 < 80:
                self.rosc_progress += dt_s * (2.0 if eff.svr_factor > 1.3 else 1.0)
                self.ischemia = max(0.0, self.ischemia - 0.004 * dt_s)
            if self.rosc_progress > 120 and self.rhythm != "vf":
                self.rhythm = "sinus_tach"
                self.ischemia = 0.5
                self.cpr = False
                self.rosc_progress = 0.0

    # ------------------------------------------------------------------
    def give_fluid(self, kind: str, ml: float) -> None:
        self.fluids_in_ml += ml
        self.blood_volume += ml
        if kind in ("lactated_ringers", "normal_saline"):
            self.crystalloid_excess += 0.75 * ml
        elif kind == "prbc":
            self.red_cell_volume += 0.6 * ml

    def snapshot(self) -> dict:
        return {
            "hr": round(self.hr, 1),
            "sbp": round(self.sbp, 1),
            "dbp": round(self.dbp, 1),
            "map": round(self.map, 1),
            "co": round(self.co, 2),
            "sv": round(self.sv, 1),
            "svr": round(self.svr, 2),
            "sao2": round(self.sao2, 4),
            "pao2": round(self.pao2, 1),
            "paco2": round(self.paco2, 1),
            "etco2": round(self.etco2, 1),
            "shunt": round(self.shunt, 3),
            "frc": round(self.frc),
            "fao2": round(self.lung_o2_ml / max(300.0, self.frc), 3),
            "blood_volume": round(self.blood_volume),
            "hb": round(self.hb, 1),
            "temp": round(self.temp, 2),
            "rhythm": self.rhythm,
            "ischemia": round(self.ischemia, 3),
            "blood_loss_ml": round(self.blood_loss_ml),
            "fluids_in_ml": round(self.fluids_in_ml),
            "urine_ml": round(self.urine_ml),
            "stomach_air_ml": round(self.stomach_air_ml),
            "cpr": self.cpr,
        }
