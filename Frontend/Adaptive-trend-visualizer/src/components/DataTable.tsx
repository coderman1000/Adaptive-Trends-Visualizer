import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio } from '@mui/material';

const DataTable = ({ selectedFields, selectedTable, selectedDb, yAxisKey, onYAxisChange }) => {
    return (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Select</TableCell>
                        <TableCell>Field</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Database</TableCell>
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
                                />
                            </TableCell>
                            <TableCell>{field}</TableCell>
                            <TableCell>{selectedTable}</TableCell>
                            <TableCell>{selectedDb}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;
