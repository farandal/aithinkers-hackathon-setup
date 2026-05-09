import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface DataPoint {
    label: string;
    value: number;
}

interface LabDataChartProps {
    title: string;
    unit?: string;
    data: DataPoint[];
}

export const LabDataChart: React.FC<LabDataChartProps> = ({ title, unit = '', data }) => {
    if (!data || data.length === 0) {
        return (
            <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2">{title}</Typography>
                <Typography variant="body2" color="text.secondary">No data</Typography>
            </Paper>
        );
    }

    const max = Math.max(...data.map(d => d.value));

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                {title} {unit && <span style={{ fontWeight: 400, color: '#888' }}>({unit})</span>}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {data.map((point, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ minWidth: 80, color: 'text.secondary', textAlign: 'right' }}>
                            {point.label}
                        </Typography>
                        <Box sx={{ flex: 1, bgcolor: 'grey.100', borderRadius: 1, height: 18, overflow: 'hidden' }}>
                            <Box
                                sx={{
                                    width: max > 0 ? `${(point.value / max) * 100}%` : '0%',
                                    bgcolor: 'primary.main',
                                    height: '100%',
                                    borderRadius: 1,
                                    transition: 'width 0.4s ease',
                                }}
                            />
                        </Box>
                        <Typography variant="caption" sx={{ minWidth: 40 }}>
                            {point.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
