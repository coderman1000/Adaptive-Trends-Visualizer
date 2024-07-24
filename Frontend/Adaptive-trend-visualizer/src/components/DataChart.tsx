import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define an array of colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#11cff8', '#00c658', '#088e58', '#ffc650'];

const DataChart = ({ data, selectedFields, yAxisKey }) => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="InsertedDateTime" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
                <YAxis dataKey={yAxisKey} />
                <Tooltip />
                <Legend />
                {selectedFields.map((field, index) => (
                    <Line
                        key={field}
                        type="monotone"
                        dataKey={field}
                        stroke={COLORS[index % COLORS.length]} // Use color array
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DataChart;
