"""Mammillary compartment pharmacokinetics with an effect-site compartment.

Amounts are tracked in the drug's native mass unit (mg or mcg); volumes in L;
rate constants in 1/min. Concentrations are therefore mg/L (= mcg/mL) or
mcg/L (= ng/mL), matching how the published models report them.

Boluses do not land in the central compartment instantly. Real IV boluses
take time to travel from the arm to the heart and mix; the delay is longer
when cardiac output is low (a classic, clinically important effect: slow
onset in shocked patients). We model that with a short transit queue.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class PKParams:
    v1: float
    k10: float
    k12: float = 0.0
    k21: float = 0.0
    k13: float = 0.0
    k31: float = 0.0
    ke0: float = 0.5


@dataclass
class _Transit:
    amount: float
    remaining_delay_s: float
    spread_s: float


@dataclass
class CompartmentModel:
    params: PKParams
    a1: float = 0.0
    a2: float = 0.0
    a3: float = 0.0
    ce: float = 0.0
    infusion_rate: float = 0.0  # amount/min
    transit: list[_Transit] = field(default_factory=list)
    total_given: float = 0.0

    @property
    def cp(self) -> float:
        return self.a1 / self.params.v1

    def bolus(self, amount: float, transit_s: float = 15.0, spread_s: float = 10.0) -> None:
        self.total_given += amount
        self.transit.append(_Transit(amount, transit_s, spread_s))

    def remove_central(self, amount: float) -> float:
        taken = min(amount, self.a1)
        self.a1 -= taken
        return taken

    def step(self, dt_s: float, co_ratio: float = 1.0) -> None:
        dt = dt_s / 60.0
        p = self.params
        # Deliver boluses in transit. Low cardiac output slows delivery.
        speed = max(0.2, min(1.5, co_ratio))
        arrived = 0.0
        still: list[_Transit] = []
        for t in self.transit:
            if t.remaining_delay_s > 0:
                t.remaining_delay_s -= dt_s * speed
                still.append(t)
                continue
            chunk = t.amount if t.spread_s <= dt_s else t.amount * dt_s / t.spread_s
            chunk = min(chunk, t.amount)
            t.amount -= chunk
            t.spread_s = max(0.0, t.spread_s - dt_s)
            arrived += chunk
            if t.amount > 1e-12:
                still.append(t)
        self.transit = still

        infused = self.infusion_rate * dt
        self.total_given += infused

        a1, a2, a3 = self.a1, self.a2, self.a3
        # Clearance of central compartment scales mildly with cardiac output
        # (hepatic blood flow) for high-extraction drugs; keep it simple.
        k10 = p.k10 * (0.7 + 0.3 * min(1.3, co_ratio))
        da1 = -(k10 + p.k12 + p.k13) * a1 + p.k21 * a2 + p.k31 * a3
        da2 = p.k12 * a1 - p.k21 * a2
        da3 = p.k13 * a1 - p.k31 * a3
        self.a1 = max(0.0, a1 + da1 * dt + arrived + infused)
        self.a2 = max(0.0, a2 + da2 * dt)
        self.a3 = max(0.0, a3 + da3 * dt)
        # Effect site: exact exponential step for stability.
        alpha = 1.0 - pow(2.718281828459045, -p.ke0 * dt)
        self.ce += (self.cp - self.ce) * alpha

    def snapshot(self) -> dict:
        return {
            "cp": self.cp,
            "ce": self.ce,
            "infusion_rate": self.infusion_rate,
            "total_given": self.total_given,
        }


def from_clearances(v1: float, v2: float, v3: float, cl1: float, cl2: float, cl3: float, ke0: float) -> PKParams:
    return PKParams(
        v1=v1,
        k10=cl1 / v1,
        k12=cl2 / v1,
        k21=cl2 / v2 if v2 > 0 else 0.0,
        k13=cl3 / v1,
        k31=cl3 / v3 if v3 > 0 else 0.0,
        ke0=ke0,
    )
