import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio, Typography, Card, CardContent, Box
} from '@mui/material';

const DataTable = ({ selectedFields, selectedTable, selectedDb, yAxisKey, onYAxisChange }) => {
    return (
        <Card sx={{ marginTop: 4, boxShadow: 3 }}>
            <CardContent>
                <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1171BA' }}>
                                <TableCell>
                                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Select
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Field
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Table
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                        Database
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selectedFields.map((field, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: '#424242',
                                        '&:hover': { backgroundColor: '#616161' }, // Hover effect
                                        cursor: 'pointer'
                                    }}
                                >
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
            </CardContent>
        </Card>
    );
};

export default DataTable;
