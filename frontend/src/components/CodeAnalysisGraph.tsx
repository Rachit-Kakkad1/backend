/**
 * Code Analysis Graph Component
 * Visualizes code analysis results with comprehensive risk and safety metrics
 */
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from 'recharts';

interface GraphNode {
  id: string;
  label: string;
  type: 'file' | 'function' | 'vulnerability' | 'dependency';
  risk: 'low' | 'medium' | 'high' | 'critical';
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'import' | 'call' | 'dependency';
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface CodeAnalysisGraphProps {
  width?: number;
  height?: number;
  data?: GraphData;
  riskScore?: number;
  vulnerabilityCount?: number;
}

const COLORS = {
  safe: '#22c55e',      // green
  low: '#84cc16',       // lime
  medium: '#eab308',    // yellow
  high: '#f97316',      // orange
  critical: '#ef4444',  // red
  background: '#0a0a0a',
};

export const CodeAnalysisGraph: React.FC<CodeAnalysisGraphProps> = ({
  data,
  riskScore = 0,
  vulnerabilityCount = 0,
}) => {
  // Calculate risk distribution from nodes
  const riskDistribution = React.useMemo(() => {
    if (!data?.nodes) {
      return {
        safe: 0,
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };
    }

    const distribution = {
      safe: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    data.nodes.forEach((node) => {
      if (node.type === 'vulnerability') {
        distribution[node.risk] = (distribution[node.risk] || 0) + 1;
      } else if (node.risk === 'low') {
        distribution.safe += 1;
      }
    });

    return distribution;
  }, [data]);

  // Prepare data for charts
  const riskPieData = [
    { name: 'Safe', value: riskDistribution.safe, color: COLORS.safe },
    { name: 'Low Risk', value: riskDistribution.low, color: COLORS.low },
    { name: 'Medium Risk', value: riskDistribution.medium, color: COLORS.medium },
    { name: 'High Risk', value: riskDistribution.high, color: COLORS.high },
    { name: 'Critical', value: riskDistribution.critical, color: COLORS.critical },
  ].filter(item => item.value > 0);

  const vulnerabilityData = data?.nodes
    .filter(node => node.type === 'vulnerability')
    .map((node, index) => ({
      name: node.label.length > 20 ? node.label.substring(0, 20) + '...' : node.label,
      fullName: node.label,
      risk: node.risk,
      value: node.risk === 'critical' ? 4 : node.risk === 'high' ? 3 : node.risk === 'medium' ? 2 : 1,
      index,
    })) || [];

  // Risk level calculation
  const getRiskLevel = (score: number) => {
    if (score === 0) return { level: 'Safe', color: COLORS.safe, percentage: 0 };
    if (score <= 2) return { level: 'Low', color: COLORS.low, percentage: (score / 2) * 25 };
    if (score <= 4) return { level: 'Medium', color: COLORS.medium, percentage: 25 + ((score - 2) / 2) * 25 };
    if (score <= 7) return { level: 'High', color: COLORS.high, percentage: 50 + ((score - 4) / 3) * 25 };
    return { level: 'Critical', color: COLORS.critical, percentage: 75 + ((score - 7) / 3) * 25 };
  };

  const riskLevel = getRiskLevel(riskScore);
  const safePercentage = riskScore === 0 ? 100 : Math.max(0, 100 - riskLevel.percentage);

  // Radial gauge data
  const gaugeData = [
    {
      name: 'Safe',
      value: safePercentage,
      fill: COLORS.safe,
    },
    {
      name: 'Risk',
      value: riskLevel.percentage,
      fill: riskLevel.color,
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold text-sm mb-1">{payload[0].name}</p>
          <p className="text-gray-300 text-xs">
            {payload[0].payload?.fullName || payload[0].value}
          </p>
          {payload[0].payload?.risk && (
            <p className="text-xs mt-1" style={{ color: COLORS[payload[0].payload.risk as keyof typeof COLORS] }}>
              Risk: {payload[0].payload.risk.toUpperCase()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // If no data, show empty state
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-black/40 rounded-xl p-12 border border-white/5 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h4 className="text-sm font-bold text-gray-400 mb-2">No Analysis Data Available</h4>
          <p className="text-xs text-gray-500">Run an analysis to see risk metrics and visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Risk vs Safe Gauge */}
      <div className="bg-black/40 rounded-xl p-6 border border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
          Overall Security Status
        </h4>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={gaugeData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={(entry: any) => entry.fill}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-3xl font-black"
                fill={riskLevel.color}
              >
                {riskScore.toFixed(1)}
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold uppercase"
                fill="#94a3b8"
              >
                {riskLevel.level} Risk
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-2xl font-black text-green-400">{safePercentage.toFixed(0)}%</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Safe</div>
          </div>
          <div className="text-center p-3 rounded-lg border" style={{ 
            backgroundColor: `${riskLevel.color}10`,
            borderColor: `${riskLevel.color}40`
          }}>
            <div className="text-2xl font-black" style={{ color: riskLevel.color }}>
              {riskLevel.percentage.toFixed(0)}%
            </div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">At Risk</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="bg-black/40 rounded-xl p-6 border border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Risk Distribution
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Vulnerability Severity Bar Chart */}
        <div className="bg-black/40 rounded-xl p-6 border border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Vulnerability Severity
          </h4>
          {vulnerabilityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vulnerabilityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 4]} stroke="#64748b" fontSize={10} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={9}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {vulnerabilityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.risk as keyof typeof COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
              No vulnerabilities detected
            </div>
          )}
        </div>
      </div>

      {/* Risk Level Breakdown */}
      <div className="bg-black/40 rounded-xl p-6 border border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Risk Level Breakdown
        </h4>
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Safe', value: riskDistribution.safe, color: COLORS.safe },
            { label: 'Low', value: riskDistribution.low, color: COLORS.low },
            { label: 'Medium', value: riskDistribution.medium, color: COLORS.medium },
            { label: 'High', value: riskDistribution.high, color: COLORS.high },
            { label: 'Critical', value: riskDistribution.critical, color: COLORS.critical },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-lg border"
              style={{
                backgroundColor: `${item.color}10`,
                borderColor: `${item.color}40`,
              }}
            >
              <div className="text-3xl font-black mb-2" style={{ color: item.color }}>
                {item.value}
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-black text-cyber-blue mb-1">{riskScore.toFixed(1)}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Risk Score</div>
        </div>
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-black text-orange-400 mb-1">{vulnerabilityCount}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Vulnerabilities</div>
        </div>
        <div className="bg-black/40 rounded-xl p-4 border border-white/5 text-center">
          <div className="text-2xl font-black text-green-400 mb-1">
            {safePercentage > 70 ? '✓' : safePercentage > 40 ? '⚠' : '✗'}
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider">Status</div>
        </div>
      </div>
    </div>
  );
};
