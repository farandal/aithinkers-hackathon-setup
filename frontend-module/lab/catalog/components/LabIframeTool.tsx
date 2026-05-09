import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface LabIframeToolProps {
    url: string;
    title?: string;
    height?: number;
}

export const LabIframeTool: React.FC<LabIframeToolProps> = ({ url, title, height = 400 }) => (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {title && (
            <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>{title}</Typography>
            </Box>
        )}
        <Box
            component="iframe"
            src={url}
            title={title ?? 'Lab tool'}
            sx={{ width: '100%', height: `${height}px`, border: 0, display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
    </Paper>
);
