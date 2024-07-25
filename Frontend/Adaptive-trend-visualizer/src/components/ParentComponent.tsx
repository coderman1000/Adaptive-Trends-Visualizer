import React, { useState, useEffect } from 'react';
import DataForm from './DataForm';
import DataChart from './DataChart';
import DataTable from './DataTable';
import axios from 'axios';
import { Box } from '@mui/material';

const ParentComponent = () => {
    const [chartData, setChartData] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [yAxisKey, setYAxisKey] = useState('');
    const [selectedDb, setSelectedDb] = useState('');
    const [selectedTable, setSelectedTable] = useState('');
    const [realTime, setRealTime] = useState(false);

    useEffect(() => {
        if (realTime && selectedDb && selectedTable && selectedFields.length) {
            const interval = setInterval(() => {
                const requestBody = {
                    dbName: selectedDb,
                    collectionName: selectedTable,
                    columns: selectedFields,
                    startTime: new Date().toISOString(),
                    endTime: ''
                };

                axios.post('http://127.0.0.1:5000/api/columns/values', requestBody)
                    .then(response => {
                        setChartData(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching chart data:', error);
                    });
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [realTime, selectedDb, selectedTable, selectedFields]);

    const handleFormSubmit = (requestBody) => {
        axios.post('http://127.0.0.1:5000/api/columns/values', requestBody)
            .then(response => {
                setChartData(response.data);
                setSelectedFields(requestBody.columns);
                setYAxisKey(requestBody.columns[0]);
                setSelectedDb(requestBody.dbName);
                setSelectedTable(requestBody.collectionName);
            })
            .catch(error => {
                console.error('Error fetching chart data:', error);
            });
    };

    return (
        <Box sx={{ padding: 2 }}>
            <DataForm onSubmit={handleFormSubmit} setRealTime={setRealTime} />
            <DataChart data={chartData} selectedFields={selectedFields} yAxisKey={yAxisKey} realTime={realTime} />
            <DataTable
                selectedFields={selectedFields}
                selectedTable={selectedTable}
                selectedDb={selectedDb}
                yAxisKey={yAxisKey}
                onYAxisChange={setYAxisKey}
            />
        </Box>
    );
};

export default ParentComponent;
