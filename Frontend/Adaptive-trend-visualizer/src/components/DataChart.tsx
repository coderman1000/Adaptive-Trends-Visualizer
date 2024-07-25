import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57', '#11cff8', '#00c658', '#088e58', '#ffc650'];

const DataChart = ({ data, selectedFields, yAxisKey, realTime }) => {
    // Limit the data to the last 5 points if in real-time mode
    const displayedData = realTime ? data.slice(-5) : data;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={displayedData}>
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
