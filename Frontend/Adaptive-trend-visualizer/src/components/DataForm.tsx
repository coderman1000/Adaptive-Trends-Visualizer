import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, FormHelperText, Card, CardContent } from '@mui/material';
import axios from 'axios';

const DataForm = ({ onSubmit }) => {
    const [databases, setDatabases] = useState(['ABC', 'db2']);
    const [selectedDb, setSelectedDb] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [fields, setFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedDb) {
            axios.get(`http://127.0.0.1:5000/api/tables/` + selectedDb)
                .then(response => {
                    setTables(response.data);
                })
                .catch(error => {
                    console.error('Error fetching tables:', error);
                });
        }
    }, [selectedDb]);

    const handleDbChange = (event) => {
        setSelectedDb(event.target.value);
        setSelectedTable('');
        setFields([]);
        setSelectedFields([]);
    };

    const handleTableChange = (event) => {
        const table = tables.find(t => t.tableName === event.target.value);
        setSelectedTable(event.target.value);
        setFields(table ? table.columns : []);
        setSelectedFields([]);
    };

    const validateFields = () => {
        if (!selectedDb) return 'Database name is required';
        if (!selectedTable) return 'Table name is required';
        if (!selectedFields.length) return 'At least one table field must be selected';
        if (!startDate) return 'Start date is required';
        if (!endDate) return 'End date is required';
        return '';
    };

    const handleDraw = () => {
        const errorMessage = validateFields();
        if (errorMessage) {
            setError(errorMessage);
            return;
        }

        setError('');

        const requestBody = {
            dbName: selectedDb,
            collectionName: selectedTable,
            columns: selectedFields,
            startTime: new Date(startDate).toISOString(),
            endTime: new Date(endDate).toISOString()
        };

        onSubmit(requestBody);
    };

    return (
        <Card sx={{ marginBottom: 4, background: '#1171BA', color: '#fff', boxShadow: 3, minWidth: 1100 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Data Selector
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} error={!!error}>
                        <InputLabel sx={{ color: '#fff' }}>DB Name</InputLabel>
                        <Select value={selectedDb} onChange={handleDbChange} sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}>
                            {databases.map(db => (
                                <MenuItem key={db} value={db}>{db}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedDb && <FormHelperText sx={{ color: '#f44336' }}>{error}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} disabled={!selectedDb} error={!!error}>
                        <InputLabel sx={{ color: '#fff' }}>Table Name</InputLabel>
                        <Select value={selectedTable} onChange={handleTableChange} sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}>
                            {tables.map(table => (
                                <MenuItem key={table.tableName} value={table.tableName}>{table.tableName}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedTable && <FormHelperText sx={{ color: '#f44336' }}>{error}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} disabled={!selectedTable} error={!!error}>
                        <InputLabel sx={{ color: '#fff' }}>Table Fields</InputLabel>
                        <Select
                            multiple
                            value={selectedFields}
                            onChange={(event) => setSelectedFields(event.target.value)}
                            renderValue={(selected) => selected.join(', ')}
                            sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
                        >
                            {fields.map(field => (
                                <MenuItem key={field} value={field}>{field}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedFields.length && <FormHelperText sx={{ color: '#f44336' }}>{error}</FormHelperText>}
                    </FormControl>

                    <TextField
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        error={!!error && !startDate}
                        helperText={error && !startDate ? error : ''}
                        InputProps={{ style: { color: '#fff' } }}
                    />

                    <TextField
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        error={!!error && !endDate}
                        helperText={error && !endDate ? error : ''}
                        InputProps={{ style: { color: '#fff' } }}
                    />

                    <Button variant="contained" color="success" onClick={handleDraw} sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                        Draw Chart
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DataForm;
