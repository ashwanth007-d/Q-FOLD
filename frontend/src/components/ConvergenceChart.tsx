import React from 'react';
import { TrendingDown, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrajectoryPoint } from '../types';

interface ConvergenceChartProps {
  trajectory: TrajectoryPoint[];
  method: string;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ trajectory, method }) => {
  if (!trajectory || trajectory.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 text-center text-slate-500 font-mono-code text-xs">
        Run simulation to view energy convergence trajectory graph.
      </div>
    );
  }

  const initialEnergy = trajectory[0]?.energy ?? 0;
  const finalEnergy = trajectory[trajectory.length - 1]?.energy ?? 0;
  const improvement = initialEnergy - finalEnergy;

  return (
    <div className="glass-panel rounded-2xl p-5 lg:p-6 space-y-4 border border-cyan-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-white">Energy Convergence Curve</h3>
            <p className="text-xs text-slate-400">Variational expectation value trajectory across iterations ({method})</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono-code text-xs">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Initial Energy</span>
            <span className="text-slate-200 font-bold">{initialEnergy.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">Final Energy</span>
            <span className="text-cyan-300 font-bold">{finalEnergy.toFixed(2)}</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-right">
            <span className="text-[10px] block font-sans">Improvement</span>
            <span className="font-bold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              {improvement >= 0 ? `-${improvement.toFixed(2)}` : `+${Math.abs(improvement).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trajectory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#06b6d4', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#06b6d4' }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#06b6d4' }}
              activeDot={{ r: 6, fill: '#a855f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
