import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { VitalsSnapshot } from "../lib/vitals";

export interface DecisionHistoryItem {
  decisionNumber: number;
  decisionTitle: string;
  isCorrect: boolean;
  complication?: string;
  vitals: { hr: number; bpSys: number; spo2: number; rr: number; temp: number };
}

export function VitalsGraph({ data }: { data: DecisionHistoryItem[] }) {
  // Format data for recharts
  const chartData = data.map((d) => ({
    name: `D${d.decisionNumber}`,
    hr: d.vitals.hr,
    bp: d.vitals.bpSys,
    spo2: d.vitals.spo2,
    rr: d.vitals.rr,
    temp: d.vitals.temp,
    isCorrect: d.isCorrect,
    decisionTitle: d.decisionTitle,
    complication: d.complication
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-sm shadow-xl shadow-black/10 text-xs text-muted-foreground w-48">
          <p className="font-bold text-foreground mb-1 font-mono-data">{label} - {data.decisionTitle}</p>
          <div className="flex items-center gap-2 mb-2">
            Status: {data.isCorrect ? <span className="text-[#2E6B4B]">Correct</span> : <span className="text-[#A32A2A]">Failed</span>}
          </div>
          {data.complication && <p className="text-[#A32A2A] mb-2 font-mono-data">⚠️ {data.complication}</p>}
          <div className="grid grid-cols-2 gap-1 font-mono-data">
             <span className="text-[#A32A2A]">HR: {data.hr}</span>
             <span className="text-[#CC553D]">BP: {data.bp}</span>
             <span className="text-[#2E6B4B]">SpO2: {data.spo2}</span>
             <span className="text-[#C27820]">RR: {data.rr}</span>
             <span className="text-[#C27820]">Temp: {data.temp}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isCorrect) {
      return <circle cx={cx} cy={cy} r={4} fill="#2E6B4B" stroke="none" />;
    }
    return <circle cx={cx} cy={cy} r={5} fill="#A32A2A" stroke="#fff" strokeWidth={1} />;
  };

  return (
    <div className="h-64 w-full bg-white border border-[#E2DDD1] rounded-sm p-4 mt-6 dark:bg-[#1E1A16] dark:border-[#3A342C]">
      <div className="text-sm font-semibold mb-2 font-mono-data text-muted-foreground">Physiology History</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD144" />
          <XAxis dataKey="name" stroke="#8C827A" tick={{ fill: "#8C827A", fontSize: 12 }} />
          <YAxis yAxisId="left" domain={[30, 180]} stroke="#8C827A" tick={{ fill: "#8C827A", fontSize: 12 }}/>
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine yAxisId="left" y={101} stroke="#C27820aa" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="left" y={125} stroke="#A32A2A88" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="left" y={90} stroke="#A32A2A88" strokeDasharray="3 3" />

          <Line yAxisId="left" type="monotone" dataKey="hr" stroke="#A32A2A" dot={<CustomizedDot />} isAnimationActive={false} strokeWidth={2}/>
          <Line yAxisId="left" type="monotone" dataKey="bp" stroke="#CC553D" dot={false} isAnimationActive={false} />
          <Line yAxisId="left" type="monotone" dataKey="spo2" stroke="#2E6B4B" dot={false} isAnimationActive={false} />
          <Line yAxisId="left" type="monotone" dataKey="rr" stroke="#C27820" dot={false} isAnimationActive={false} />
          <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#D99B26" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
