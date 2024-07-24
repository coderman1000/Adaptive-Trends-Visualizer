import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DataChart = ({ data, selectedFields, yAxisKey }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="InsertedDateTime" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
                <YAxis dataKey={yAxisKey} />
                <Tooltip />
                <Legend />
                {selectedFields.map(field => (
                    <Line key={field} type="monotone" dataKey={field} stroke="#8884d8" />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DataChart;
