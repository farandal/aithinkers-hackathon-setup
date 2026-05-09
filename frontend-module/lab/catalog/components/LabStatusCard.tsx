import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

type LabStatus = 'active' | 'warning' | 'error' | 'idle';

interface Metric {
    label: string;
    value: string;
}

interface LabStatusCardProps {
    title: string;
    status: LabStatus;
    metrics?: Metric[];
}

const STATUS_COLORS: Record<LabStatus, 'success' | 'warning' | 'error' | 'default'> = {
    active:  'success',
    warning: 'warning',
    error:   'error',
    idle:    'default',
};

export const LabStatusCard: React.FC<LabStatusCardProps> = ({ title, status, metrics = [] }) => (
    <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
            <Chip label={status} color={STATUS_COLORS[status]} size="small" />
        </Box>
        {metrics.length > 0 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                {metrics.map((m, i) => (
                    <Box key={i}>
                        <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                        <Typography variant="body2" fontWeight={500}>{m.value}</Typography>
                    </Box>
                ))}
            </Box>
        )}
    </Paper>
);
