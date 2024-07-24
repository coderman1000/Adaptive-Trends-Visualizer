import React, { useState } from 'react';
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
            <DataForm onSubmit={handleFormSubmit} />
            <DataChart data={chartData} selectedFields={selectedFields} yAxisKey={yAxisKey} />
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
