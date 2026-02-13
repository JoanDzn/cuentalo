import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ExpenseChartProps {
    data: any[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
    // Process data to group by date
    // Assuming data is sorted

    return (
        <div className="w-full h-[200px] bg-white dark:bg-zinc-900/50 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Tendencia de Gastos</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#888' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelStyle={{ color: '#666' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExpenseChart;
