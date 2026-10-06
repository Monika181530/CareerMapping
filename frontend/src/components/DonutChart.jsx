import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DonutChart = ({ matchPercent }) => {
  const data = [
    { name: 'Match', value: matchPercent || 0 },
    { name: 'Gap', value: 100 - (matchPercent || 0) }
  ];
  const COLORS = ['var(--accent-green)', 'var(--surface-2)'];

  return (
    <div style={{ width: '100%', height: 300, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={80}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)'
      }}>
        {matchPercent || 0}%
      </div>
    </div>
  );
};

export default DonutChart;
