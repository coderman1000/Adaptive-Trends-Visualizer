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
            axios.get(`http://localhost:5000/api/tables/` + selectedDb)
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
        <Card sx={{ marginBottom: 4, background: '#f5f0ff', boxShadow: 3 }} color="primary" >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Data Selector
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} error={!!error}>
                        <InputLabel>DB Name</InputLabel>
                        <Select value={selectedDb} onChange={handleDbChange}>
                            {databases.map(db => (
                                <MenuItem key={db} value={db}>{db}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedDb && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} disabled={!selectedDb} error={!!error}>
                        <InputLabel>Table Name</InputLabel>
                        <Select value={selectedTable} onChange={handleTableChange}>
                            {tables.map(table => (
                                <MenuItem key={table.tableName} value={table.tableName}>{table.tableName}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedTable && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>

                    <FormControl fullWidth sx={{ flex: 1, minWidth: 150 }} disabled={!selectedTable} error={!!error}>
                        <InputLabel>Table Fields</InputLabel>
                        <Select
                            multiple
                            value={selectedFields}
                            onChange={(event) => setSelectedFields(event.target.value)}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {fields.map(field => (
                                <MenuItem key={field} value={field}>{field}</MenuItem>
                            ))}
                        </Select>
                        {!!error && !selectedFields.length && <FormHelperText>{error}</FormHelperText>}
                    </FormControl>

                    <TextField
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        error={!!error && !startDate}
                        helperText={error && !startDate ? error : ''}
                    />

                    <TextField
                        fullWidth
                        sx={{ flex: 1, minWidth: 150 }}
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        error={!!error && !endDate}
                        helperText={error && !endDate ? error : ''}
                    />

                    <Button variant="contained" color="primary" onClick={handleDraw} sx={{ flexShrink: 0, minWidth: 150 }}>
                        Draw
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DataForm;
