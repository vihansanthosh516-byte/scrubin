"""Physiology validation: the model must reproduce textbook clinical behaviour.

Tolerances are deliberately clinical ("30-60 s", "3-7 min"), not exact:
the aim is that an experienced anesthesiologist watching the monitor would
find the patient believable.
"""

from helpers import appy, induce_and_intubate, lean, monitors, preoxygenate


def run_until(c, pred, max_s):
    t0 = c.t
    while c.t - t0 < max_s:
        c.step()
        if pred(c):
            return c.t - t0
    return None


def test_awake_baseline_is_stable():
    c = appy()
    start = (c.body.hr, c.body.map, c.body.sao2)
    c.run(300)
    assert abs(c.body.hr - start[0]) / start[0] < 0.03
    assert abs(c.body.map - start[1]) / start[1] < 0.03
    assert abs(c.body.sao2 - start[2]) < 0.01
    assert 0.94 < c.body.sao2 < 0.99  # obese, febrile, room air
    assert 35 < c.body.paco2 < 41


def test_preoxygenation_raises_alveolar_o2():
    c = appy()
    preoxygenate(c, 180)
    assert c.body.lung_o2_ml / c.body.frc > 0.8  # EtO2 target >= ~0.85-0.9
    assert c.body.pao2 > 350


def test_propofol_induction_onset_apnea_and_hypotension():
    c = lean()
    monitors(c)
    preoxygenate(c, 120)
    map0 = c.body.map
    c.submit({"type": "drug", "drug": "propofol", "dose": 2.0 * c.patient.lbm_kg})
    loc = run_until(c, lambda c: c.eff.bis < 70, 120)
    assert loc is not None and 20 <= loc <= 60, loc
    apnea = run_until(c, lambda c: c.body.spont_ve == 0, 90)
    assert apnea is not None
    c.run(60)
    drop = (map0 - c.body.map) / map0
    assert 0.12 < drop < 0.45, drop


def test_opioid_blunts_laryngoscopy_response():
    def hr_rise(fentanyl):
        c = lean()
        preoxygenate(c, 60)
        if fentanyl:
            c.submit({"type": "drug", "drug": "fentanyl", "dose": 150})
            c.run(180)
        c.submit({"type": "drug", "drug": "propofol", "dose": 110})
        c.submit({"type": "drug", "drug": "rocuronium", "dose": 42})
        c.run(120)
        hr0 = c.body.hr
        c.submit({"type": "airway", "maneuver": "intubate", "laryngoscope": "mac4"})
        peak = hr0
        for _ in range(120):
            c.step()
            peak = max(peak, c.body.hr)
        return (peak - hr0) / hr0

    assert hr_rise(False) > hr_rise(True) + 0.05


def test_apneic_desaturation_times():
    def time_to_90(case_factory, preox):
        c = case_factory()
        if preox:
            preoxygenate(c, 180)
        else:
            c.submit({"type": "gas", "o2_flow": 0.21})
        c.submit({"type": "drug", "drug": "propofol", "dose": round(2 * c.patient.lbm_kg)})
        c.submit({"type": "drug", "drug": "rocuronium", "dose": round(1.2 * c.patient.weight_kg)})
        c.submit({"type": "infusion", "drug": "propofol", "rate": 150, "unit": "mcg/kg/min"})
        return run_until(c, lambda c: c.body.sao2 < 0.90, 900)

    lean_pre = time_to_90(lean, True)
    obese_pre = time_to_90(appy, True)
    obese_air = time_to_90(appy, False)
    assert lean_pre is not None and 330 <= lean_pre <= 540, lean_pre
    assert obese_pre is not None and 180 <= obese_pre < lean_pre, obese_pre
    assert obese_air is not None and obese_air < 120, obese_air


def test_rocuronium_onset_and_duration():
    c = lean()
    preoxygenate(c, 30)
    c.submit({"type": "drug", "drug": "propofol", "dose": 140})
    c.submit({"type": "infusion", "drug": "propofol", "rate": 120, "unit": "mcg/kg/min"})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 42})  # 0.6 mg/kg
    c.submit({"type": "bag", "on": True})
    onset = run_until(c, lambda c: c.eff.tof_count == 0, 240)
    assert onset is not None and 60 <= onset <= 130, onset
    dur = run_until(c, lambda c: c.eff.nmb_t1 > 0.25, 5400)
    assert dur is not None and 25 * 60 <= dur + onset <= 50 * 60, (dur + onset) / 60


def test_sugammadex_reverses_deep_block_within_minutes():
    c = lean()
    c.submit({"type": "drug", "drug": "propofol", "dose": 140})
    c.submit({"type": "infusion", "drug": "propofol", "rate": 120, "unit": "mcg/kg/min"})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 42})
    c.run(600)
    assert c.eff.tof_count == 0
    c.submit({"type": "drug", "drug": "sugammadex", "dose": 4 * 70})
    t = run_until(c, lambda c: c.eff.tof_count == 4 and c.eff.tof_ratio > 0.9, 600)
    assert t is not None and t < 300, t


def test_neostigmine_cannot_reverse_deep_block():
    c = lean()
    c.submit({"type": "drug", "drug": "propofol", "dose": 140})
    c.submit({"type": "infusion", "drug": "propofol", "rate": 120, "unit": "mcg/kg/min"})
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 70})  # 1 mg/kg
    c.run(300)
    c.submit({"type": "drug", "drug": "glycopyrrolate", "dose": 0.6})
    c.submit({"type": "drug", "drug": "neostigmine", "dose": 3.5})
    c.run(600)
    assert c.eff.tof_ratio < 0.9


def test_succinylcholine_fast_onset_short_duration():
    c = lean()
    c.submit({"type": "drug", "drug": "propofol", "dose": 140})
    c.submit({"type": "drug", "drug": "succinylcholine", "dose": 100})
    onset = run_until(c, lambda c: c.eff.nmb_t1 < 0.05, 180)
    assert onset is not None and onset <= 75, onset
    rec = run_until(c, lambda c: c.eff.nmb_t1 > 0.9, 1800)
    assert rec is not None and 3 * 60 <= rec + onset <= 12 * 60, (rec + onset) / 60


def test_esophageal_intubation_no_co2_and_desaturation():
    c = appy()
    monitors(c)
    preoxygenate(c, 180)
    induce_and_intubate(c, force_location="esophagus")
    c.run(60)
    readout = c.monitors.readout(c.t, c.body, c.airway, c.eff, c.machine)
    assert readout["etco2"] == 0
    assert readout["capno_shape"] == "none"
    r = c.submit({"type": "assess", "what": "auscultate"})
    assert "epigastrium" in r["finding"]
    t = run_until(c, lambda c: c.body.sao2 < 0.9, 600)
    assert t is not None


def test_correct_intubation_ventilates():
    c = appy()
    monitors(c)
    preoxygenate(c, 180)
    induce_and_intubate(c, force_location="trachea")
    c.run(300)
    assert c.airway.capno_shape == "normal"
    assert 30 < c.body.etco2 < 50
    assert c.body.sao2 > 0.95


def test_right_mainstem_raises_pressure_and_shunt():
    c = appy()
    preoxygenate(c, 120)
    induce_and_intubate(c, force_location="trachea")
    c.submit({"type": "gas", "o2_flow": 0.5, "air_flow": 1.5})
    c.run(300)
    p0, s0 = c.airway.peak_pressure, c.body.sao2
    c.submit({"type": "airway", "maneuver": "reposition_tube", "depth_cm": 27})
    c.run(300)
    assert c.airway.peak_pressure > p0 + 3
    assert c.body.sao2 < s0
    r = c.submit({"type": "assess", "what": "auscultate"})
    assert "right" in r["finding"].lower()


def test_pneumoperitoneum_raises_etco2_pressures_and_svr():
    c = appy()
    preoxygenate(c, 120)
    induce_and_intubate(c, force_location="trachea")
    c.submit({"type": "volatile", "percent": 2.2})
    c.run(1800)  # CO2 stores reach steady state
    c.submit({"type": "drug", "drug": "rocuronium", "dose": 30})  # keep paralysed
    c.run(120)
    et0, peak0, svr0 = c.body.etco2, c.airway.peak_pressure, c.body.svr
    c.load.iap_mmhg = 15
    c.load.co2_absorption_ml_min = 40
    c.run(900)
    assert c.body.etco2 > et0 + 4
    assert c.airway.peak_pressure > peak0 + 4
    assert c.body.svr > svr0


def test_hemorrhage_tachycardia_then_hypotension():
    c = appy()
    preoxygenate(c, 120)
    induce_and_intubate(c, force_location="trachea")
    c.submit({"type": "volatile", "percent": 2.2})
    c.run(600)
    hr0, map0 = c.body.hr, c.body.map
    c.load.bleeding_ml_min = 0.30 * c.body.bv0 / 10  # 30% over 10 min
    c.run(600)
    c.load.bleeding_ml_min = 0
    assert c.body.hr > hr0 * 1.12
    assert c.body.map < map0 * 0.85
    # Volume resuscitation improves pressure.
    m_low = c.body.map
    c.submit({"type": "fluid", "fluid": "prbc", "volume_ml": 1000})
    c.run(1200)
    assert c.body.map > m_low + 8


def test_phenylephrine_raises_bp_with_reflex_bradycardia():
    c = appy()
    preoxygenate(c, 120)
    induce_and_intubate(c, force_location="trachea")
    c.submit({"type": "volatile", "percent": 2.5})
    c.run(600)
    map0, hr0 = c.body.map, c.body.hr
    c.submit({"type": "drug", "drug": "phenylephrine", "dose": 120})
    c.run(90)
    assert c.body.map > map0 * 1.1
    assert c.body.hr < hr0


def test_sevoflurane_uptake_reaches_about_one_mac():
    c = appy()
    preoxygenate(c, 60)
    induce_and_intubate(c, force_location="trachea")
    c.submit({"type": "infusion", "drug": "propofol", "stop": True})
    c.submit({"type": "gas", "o2_flow": 1, "air_flow": 1})
    c.submit({"type": "volatile", "percent": 3.0})
    c.run(900)
    assert 0.8 < c.pharm.volatile.et_mac < 1.3
    assert 30 < c.eff.bis < 60
