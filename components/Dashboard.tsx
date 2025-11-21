import React, { useEffect, useState } from 'react';
import { ProjectStats, ThemeConfig } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, TrendingUp, CheckCircle, Circle, Clock, Loader2 } from 'lucide-react';
import { generateProjectInsight } from '../services/gemini';

interface DashboardProps {
  stats: ProjectStats;
  theme: ThemeConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, theme }) => {
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Generate AI Insight when stats change heavily
  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const text = await generateProjectInsight(stats);
      setInsight(text);
      setLoadingInsight(false);
    };
    
    // Debounce or simple check to avoid spamming API on initial load if empty
    if (stats.total > 0) {
      fetchInsight();
    } else {
      setInsight("เริ่มสร้างงานแรกของคุณเพื่อให้ AI วิเคราะห์ข้อมูลได้เลย!");
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.total, stats.done]);

  const data = [
    { name: 'Todo', value: stats.todo, color: '#94a3b8' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Done', value: stats.done, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
          Overview
        </span>
      </div>

      {/* AI Insight Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-${theme.name}-500 to-${theme.name}-600 text-white p-6 shadow-lg`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="font-semibold text-lg">AI Smart Insight</h3>
          </div>
          <div className="min-h-[3rem] text-white/90 text-base leading-relaxed">
            {loadingInsight ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                <span>กำลังวิเคราะห์ข้อมูลโครงการ...</span>
              </div>
            ) : (
              <p>{insight}</p>
            )}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Circle className="w-5 h-5 text-slate-500" />}
          title="Todo" 
          value={stats.todo} 
          color="bg-slate-100" 
          textColor="text-slate-700"
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-blue-500" />}
          title="In Progress" 
          value={stats.inProgress} 
          color="bg-blue-50" 
          textColor="text-blue-700"
        />
        <StatCard 
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
          title="Completed" 
          value={stats.done} 
          color="bg-emerald-50" 
          textColor="text-emerald-700"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          title="Total Tasks" 
          value={stats.total} 
          color="bg-purple-50" 
          textColor="text-purple-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Task Status Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution (Simulated Visual) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Priority Breakdown</h3>
          <div className="space-y-4">
             <ProgressBar label="High Priority" count={stats.highPriority} total={stats.total} color="bg-red-500" />
             <ProgressBar label="Standard Tasks" count={stats.total - stats.highPriority} total={stats.total} color="bg-slate-400" />
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System healthy.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Data updated automatically via Gemini logic simulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, textColor }: any) => (
  <div className={`p-4 rounded-xl border border-transparent ${color} transition-all hover:shadow-md`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-slate-500">{title}</span>
      {icon}
    </div>
    <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
  </div>
);

const ProgressBar = ({ label, count, total, color }: any) => {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{count} tasks ({Math.round(percent)}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

export default Dashboard;