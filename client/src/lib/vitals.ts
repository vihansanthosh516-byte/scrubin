export interface VitalsSnapshot {
  hr: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
  rr: number;
  temp: number;
  etco2?: number;
}

export function getDefaultVitals(): VitalsSnapshot {
  return {
    hr: 75,
    bpSys: 120,
    bpDia: 80,
    spo2: 98,
    rr: 14,
    temp: 37.0,
    etco2: 35,
  };
}
