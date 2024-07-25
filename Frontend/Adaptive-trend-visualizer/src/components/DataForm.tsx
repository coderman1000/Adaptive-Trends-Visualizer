import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, FormHelperText, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DataForm = ({ onSubmit, setRealTime }) => {
    const [databases, setDatabases] = useState(['ABC', 'db2']);
    const [selectedDb, setSelectedDb] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [fields, setFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState('');
    const [realTime, setLocalRealTime] = useState(false);

    useEffect(() => {
        if (selectedDb) {
            axios.get(`http://127.0.0.1:5000/api/tables/${selectedDb}`)
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
        if (!realTime && !startDate) return 'Start date is required';
        if (!realTime && !endDate) return 'End date is required';
        return '';
    };

    const addHours = (date, hours) => {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() + hours);
        return newDate;
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
            startTime: realTime ? new Date().toISOString() : addHours(startDate, 5).toISOString(),
            endTime: realTime ? '' : addHours(endDate, 5).toISOString()
        };

        onSubmit(requestBody);
    };

    const handleRealTimeChange = (event) => {
        setLocalRealTime(event.target.checked);
        setRealTime(event.target.checked);
    };

    const CustomInput = ({ value, onClick }) => (
        <TextField
            fullWidth
            value={value}
            onClick={onClick}
            InputProps={{ style: { color: '#FFFFFF' } }} // Custom font color for selected date/time
        />
    );

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

                    <FormControlLabel
                        control={
                            <Switch
                                checked={realTime}
                                onChange={handleRealTimeChange}
                                color="primary"
                            />
                        }
                        label="Real Time"
                        sx={{ color: '#fff' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 150 }}>
                        <Typography sx={{ color: '#fff' }}>Start Date & Time</Typography>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            timeFormat="HH:mm:ss"
                            timeIntervals={15}
                            customInput={<CustomInput />}
                            disabled={realTime}
                        />
                        {!!error && !startDate && !realTime && <FormHelperText sx={{ color: '#f44336' }}>{error}</FormHelperText>}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 150 }}>
                        <Typography sx={{ color: '#fff' }}>End Date & Time</Typography>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            showTimeSelect
                            dateFormat="Pp"
                            timeFormat="HH:mm:ss"
                            timeIntervals={15}
                            customInput={<CustomInput />}
                            disabled={realTime}
                        />
                        {!!error && !endDate && !realTime && <FormHelperText sx={{ color: '#f44336' }}>{error}</FormHelperText>}
                    </Box>

                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleDraw}
                        sx={{ flexShrink: 0, fontWeight: 'bold' }}
                        disabled={realTime}
                    >
                        Draw Chart
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DataForm;
