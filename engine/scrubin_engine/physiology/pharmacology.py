"""Whole-body pharmacology: every drug on board and what it does.

Pharmacodynamics use Emax / Hill models and, where drugs interact, a Greco
response surface (propofol + opioid synergy for suppressing responses to
noxious stimuli, per Bouillon 2004 / Minto 2000). Parameters are chosen so
common clinical doses produce textbook behaviour; see tests/physiology.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from math import exp

from ..patient import PatientSpec
from .drugs import DRUGS
from .pk import CompartmentModel

ROC_UMOL_PER_MG = 1.0 / 0.6097  # rocuronium MW 609.7
SUG_UMOL_PER_MG = 1.0 / 2.178  # sugammadex MW 2178


def hill(x: float, c50: float, gamma: float = 1.0) -> float:
    if x <= 0 or c50 <= 0:
        return 0.0
    r = (x / c50) ** gamma
    return r / (1.0 + r)


def hill_u(u: float, gamma: float) -> float:
    if u <= 0:
        return 0.0
    r = u**gamma
    return r / (1.0 + r)


@dataclass
class Volatile:
    """Sevoflurane uptake: circuit -> alveoli -> tissues, plus brain effect site."""

    mac_age: float
    fi: float = 0.0  # inspired %
    fa: float = 0.0  # alveolar / end-tidal %
    fv: float = 0.0  # tissue/venous %
    ce: float = 0.0  # brain %
    circuit_l: float = 6.0

    def step(self, dt_s: float, vaporizer: float, fgf: float, va: float, frc_l: float, co_ratio: float, connected: bool) -> None:
        dt = dt_s / 60.0
        dfi = fgf / self.circuit_l * (vaporizer - self.fi)
        if connected:
            dfi -= 0.4 * va / self.circuit_l * (self.fi - self.fa)
        self.fi = max(0.0, self.fi + dfi * dt)
        wash = (va / max(frc_l, 0.5)) if connected else 0.0
        k_up = 0.94 * max(0.2, co_ratio)
        dfa = wash * ((self.fi if connected else 0.0) - self.fa) - k_up * (self.fa - self.fv)
        if not connected and va > 0:
            # Breathing room air (mask off): agent washes out.
            dfa -= va / max(frc_l, 0.5) * self.fa
        self.fa = max(0.0, self.fa + dfa * dt)
        self.fv = max(0.0, self.fv + 0.023 * (self.fa - self.fv) * dt)
        self.ce += (self.fa - self.ce) * (1.0 - exp(-0.3 * dt))

    @property
    def mac_fraction(self) -> float:
        return self.ce / self.mac_age

    @property
    def et_mac(self) -> float:
        return self.fa / self.mac_age


@dataclass
class Effects:
    bis: float = 97.0
    hyp_u: float = 0.0
    consciousness: str = "awake"
    opioid_eq: float = 0.0  # remifentanil-equivalent effect-site ng/mL
    resp_factor: float = 1.0
    nmb_t1: float = 1.0
    tof_count: int = 4
    tof_ratio: float = 1.0
    diaphragm_block: float = 0.0
    airway_tone: float = 1.0
    svr_factor: float = 1.0
    venodilation: float = 0.0
    contractility: float = 1.0
    hr_factor: float = 1.0
    vagal_add: float = 0.0
    vagal_block: float = 0.0
    baro_gain: float = 1.0
    mac: float = 0.0
    fasciculating: bool = False
    # Components kept so stimulus response can be evaluated later.
    ce_prop: float = 0.0
    sevo_mac: float = 0.0
    fi_sevo: float = 0.0  # inspired sevo % (gas analyser)
    et_sevo: float = 0.0  # end-tidal sevo %


@dataclass
class Pharmacology:
    patient: PatientSpec
    models: dict[str, CompartmentModel] = field(default_factory=dict)
    volatile: Volatile = field(init=False)
    sugammadex_e: float = 0.0  # effect-site free sugammadex, umol/L
    ever_given: dict[str, float] = field(default_factory=dict)
    sux_fasciculation_s: float = 0.0

    def __post_init__(self) -> None:
        self.volatile = Volatile(mac_age=self.patient.sevo_mac)

    # --- administration -------------------------------------------------

    def _model(self, drug_id: str) -> CompartmentModel | None:
        d = DRUGS[drug_id]
        if d.pk is None:
            return None
        if drug_id not in self.models:
            self.models[drug_id] = CompartmentModel(d.pk(self.patient))
        return self.models[drug_id]

    def give(self, drug_id: str, amount: float) -> None:
        d = DRUGS[drug_id]
        self.ever_given[drug_id] = self.ever_given.get(drug_id, 0.0) + amount
        m = self._model(drug_id)
        if m is not None:
            m.bolus(amount, transit_s=d.transit_s)
        if drug_id == "succinylcholine" and amount > 20:
            self.sux_fasciculation_s = 25.0

    def set_infusion(self, drug_id: str, amount_per_min: float) -> None:
        m = self._model(drug_id)
        if m is not None:
            m.infusion_rate = max(0.0, amount_per_min)

    def ce(self, drug_id: str) -> float:
        m = self.models.get(drug_id)
        return m.ce if m else 0.0

    def cp(self, drug_id: str) -> float:
        m = self.models.get(drug_id)
        return m.cp if m else 0.0

    # --- time step ------------------------------------------------------

    def step(self, dt_s: float, co_ratio: float, va: float, fgf: float, vaporizer: float, frc_l: float, circuit_connected: bool) -> None:
        for m in self.models.values():
            m.step(dt_s, co_ratio)
        self.volatile.step(dt_s, vaporizer, fgf, va, frc_l, co_ratio, circuit_connected)
        self._bind_sugammadex(dt_s)
        if self.sux_fasciculation_s > 0:
            # Fasciculations start as the drug reaches the junction.
            if self.ce("succinylcholine") > 0.5:
                self.sux_fasciculation_s -= dt_s

    def _bind_sugammadex(self, dt_s: float) -> None:
        sug = self.models.get("sugammadex")
        roc = self.models.get("rocuronium")
        if sug is None:
            return
        # Effect-site (neuromuscular junction interstitium) free sugammadex.
        c_sug_plasma = sug.a1 * SUG_UMOL_PER_MG / sug.params.v1
        self.sugammadex_e += (c_sug_plasma - self.sugammadex_e) * (1.0 - exp(-1.0 * dt_s / 60.0))
        # Plasma sugammadex effect-site reading should not double count.
        sug.ce = 0.0
        if roc is None:
            return
        # Plasma: 1:1 encapsulation of free rocuronium.
        roc_umol = roc.a1 * ROC_UMOL_PER_MG
        sug_umol = sug.a1 * SUG_UMOL_PER_MG
        bound = min(roc_umol, sug_umol)
        roc.a1 -= bound / ROC_UMOL_PER_MG
        sug.a1 -= bound / SUG_UMOL_PER_MG
        # Junction: free rocuronium is captured by sugammadex that has arrived.
        roc_e = roc.ce * ROC_UMOL_PER_MG
        bound_e = min(roc_e, self.sugammadex_e)
        roc.ce = max(0.0, (roc_e - bound_e) / ROC_UMOL_PER_MG)
        self.sugammadex_e -= bound_e

    # --- pharmacodynamics -----------------------------------------------

    def effects(self) -> Effects:
        e = Effects()
        ce_prop = self.ce("propofol")
        ce_mid = self.ce("midazolam")
        sevo = self.volatile.mac_fraction
        e.ce_prop, e.sevo_mac, e.mac = ce_prop, sevo, self.volatile.et_mac
        e.fi_sevo, e.et_sevo = self.volatile.fi, self.volatile.fa

        # Opioids expressed as remifentanil-equivalent effect-site conc.
        naloxone = self.ce("naloxone")
        antagonism = 1.0 + naloxone / 0.0015
        opioid = (self.ce("remifentanil") + 1.2 * self.ce("fentanyl")) / antagonism
        e.opioid_eq = opioid

        # Hypnosis -> BIS-like depth index (Bouillon-style shallow Hill).
        u_opioid = opioid / 4.0
        u_hyp = (ce_prop / 4.8 + sevo * 1.4 + ce_mid / 0.25) * (1.0 + 0.5 * u_opioid / (1.0 + u_opioid))
        e.hyp_u = u_hyp
        e.bis = 97.0 * (1.0 - hill_u(u_hyp, 1.6))
        if e.bis > 80:
            e.consciousness = "awake"
        elif e.bis > 65:
            e.consciousness = "sedated"
        elif e.bis > 40:
            e.consciousness = "anesthetized"
        elif e.bis > 25:
            e.consciousness = "deep"
        else:
            e.consciousness = "burst_suppression"

        # Respiratory drive depression (multiplicative across classes).
        e_opi = hill(opioid, 2.0, 1.6)
        e_prop = hill(ce_prop, 2.4, 2.8)
        e_sevo = hill_u(sevo / 1.3, 2.0)
        e_mid = hill(ce_mid, 0.3, 2.0)
        e.resp_factor = (1 - e_opi) * (1 - e_prop) * (1 - e_sevo) * (1 - e_mid)

        # Neuromuscular block.
        neo = self.ce("neostigmine")
        neo_e = 1.2 * hill(neo, 0.1)
        roc_u = self.ce("rocuronium") / (1.0 * (1.0 + neo_e))
        sux_u = self.ce("succinylcholine") / 3.0
        total_u = roc_u + sux_u
        roc_share = roc_u / total_u if total_u > 0 else 0.0
        twitches = []
        for n in range(4):
            fade = 1.0 - 0.13 * n * roc_share
            twitches.append(1.0 - hill_u(total_u / fade, 4.5) if total_u > 0 else 1.0)
        e.nmb_t1 = twitches[0]
        e.tof_count = sum(1 for t in twitches if t > 0.05)
        e.tof_ratio = (twitches[3] / twitches[0]) if twitches[0] > 0.05 else 0.0
        e.diaphragm_block = hill_u(total_u / 1.6, 4.5) if total_u > 0 else 0.0
        airway_block = hill_u(total_u / 0.7, 4.5) if total_u > 0 else 0.0
        e.airway_tone = (1.0 - airway_block) * (1.0 if e.bis > 70 else 0.35 + 0.65 * max(0.0, (e.bis - 40) / 30))
        e.fasciculating = 0 < self.sux_fasciculation_s < 25.0 and self.ce("succinylcholine") > 0.5

        # Cardiovascular.
        e_prop_cv = hill(ce_prop, 3.5, 1.5)
        svr = (1 - 0.38 * e_prop_cv) * (1 - 0.28 * min(sevo, 2.0) / (0.4 + min(sevo, 2.0)) * 1.4)
        contract = (1 - 0.15 * e_prop_cv) * (1 - 0.12 * min(sevo, 2.0))
        venodil = 0.12 * e_prop_cv + 0.04 * min(sevo, 2.0)
        hr = 1.0
        baro = (1 - 0.65 * e_prop_cv) * (1 - 0.3 * min(sevo, 1.5))

        phe = hill(self.ce("phenylephrine"), 20.0)
        svr *= 1 + 1.0 * phe
        venodil -= 0.08 * phe  # venoconstriction improves preload

        eph = hill(self.ce("ephedrine"), 0.8)
        contract *= 1 + 0.5 * eph
        hr *= 1 + 0.25 * eph
        svr *= 1 + 0.25 * eph

        epi_c = self.ce("epinephrine")
        epi_b = hill(epi_c, 1.5)
        epi_a = hill(epi_c, 4.0, 1.5)
        hr *= 1 + 0.7 * epi_b
        contract *= 1 + 0.9 * epi_b
        svr *= (1 - 0.1 * epi_b) * (1 + 1.2 * epi_a)

        esm = hill(self.ce("esmolol"), 2.0)
        hr *= 1 - 0.35 * esm
        contract *= 1 - 0.2 * esm

        e_atr = hill(self.ce("atropine"), 0.012)
        e_gly = hill(self.ce("glycopyrrolate"), 0.005)
        e.vagal_block = 1 - (1 - e_atr) * (1 - e_gly)
        vagal = 0.12 * e_opi + 0.55 * (neo_e / 1.2)
        if self.ce("succinylcholine") > 0.5 and self.ever_given.get("succinylcholine", 0) > 1.6 * self.patient.weight_kg:
            vagal += 0.2  # repeat-dose sux bradycardia
        e.vagal_add = vagal * (1 - e.vagal_block)

        e.svr_factor = svr
        e.contractility = contract
        e.venodilation = venodil
        e.hr_factor = hr
        e.baro_gain = baro
        return e

    def stimulus_response(self, intensity: float, eff: Effects | None = None) -> float:
        """Magnitude (0..intensity) of autonomic/motor response to a noxious stimulus.

        Greco response surface: probability of *no* response rises with
        propofol, volatile and opioid, with strong propofol-opioid synergy.
        """
        if intensity <= 0:
            return 0.0
        eff = eff or self.effects()
        u_p = eff.ce_prop / 5.6 + eff.sevo_mac / 1.3 + self.ce("midazolam") / 0.6
        u_o = eff.opioid_eq / 15.0
        u = u_p + u_o + 5.0 * u_p * u_o
        p_no_response = hill_u(u / intensity, 3.0)
        return intensity * (1.0 - p_no_response)

    def snapshot(self) -> dict:
        drugs = {
            k: {"cp": round(m.cp, 4), "ce": round(m.ce, 4), "infusion_rate": round(m.infusion_rate, 4), "total": round(m.total_given, 3)}
            for k, m in self.models.items()
        }
        return {
            "drugs": drugs,
            "sevo": {"fi": round(self.volatile.fi, 2), "fa": round(self.volatile.fa, 2), "mac": round(self.volatile.et_mac, 2)},
            "given": {k: round(v, 3) for k, v in self.ever_given.items()},
        }
