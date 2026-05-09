import React from 'react';
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

interface LabResultTableProps {
    title?: string;
    columns: string[];
    rows: (string | number)[][];
}

export const LabResultTable: React.FC<LabResultTableProps> = ({ title, columns, rows }) => (
    <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
        {title && (
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
            </Box>
        )}
        <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col, i) => (
                            <TableCell key={i} sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>{col}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, i) => (
                        <TableRow key={i} hover>
                            {row.map((cell, j) => (
                                <TableCell key={j}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    </Paper>
);
