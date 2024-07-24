import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Typography } from '@mui/material';

const DataTable = ({ selectedFields, selectedTable, selectedDb, yAxisKey, onYAxisChange }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 4, backgroundColor: '#333', color: '#fff' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>Select</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>Field</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>Table</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>Database</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {selectedFields.map((field, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Radio
                                    checked={yAxisKey === field}
                                    onChange={() => onYAxisChange(field)}
                                    value={field}
                                    sx={{ color: '#fff' }}
                                />
                            </TableCell>
                            <TableCell sx={{ color: '#fff' }}>{field}</TableCell>
                            <TableCell sx={{ color: '#fff' }}>{selectedTable}</TableCell>
                            <TableCell sx={{ color: '#fff' }}>{selectedDb}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;
