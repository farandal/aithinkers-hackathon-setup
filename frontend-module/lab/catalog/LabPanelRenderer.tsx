import React from 'react';
import { Box, Typography } from '@mui/material';
import { LabDataChart } from './components/LabDataChart';
import { LabResultTable } from './components/LabResultTable';
import { LabStatusCard } from './components/LabStatusCard';
import { LabIframeTool } from './components/LabIframeTool';

type PanelData = Record<string, unknown> | Array<Record<string, unknown>>;

interface LabPanelRendererProps {
    panel: PanelData | null;
}

function renderSinglePanel(item: Record<string, unknown>): React.ReactNode {
    const type = item.type as string;

    switch (type) {
        case 'LabDataChart':
            return <LabDataChart {...(item as any)} />;
        case 'LabResultTable':
            return <LabResultTable {...(item as any)} />;
        case 'LabStatusCard':
            return <LabStatusCard {...(item as any)} />;
        case 'LabIframeTool':
            return <LabIframeTool {...(item as any)} />;
        default:
            return (
                <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Unknown panel type: {type}
                    </Typography>
                </Box>
            );
    }
}

export const LabPanelRenderer: React.FC<LabPanelRendererProps> = ({ panel }) => {
    if (!panel) return null;

    const items = Array.isArray(panel) ? panel : [panel];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item, i) => (
                <Box key={i}>
                    {renderSinglePanel(item as Record<string, unknown>)}
                </Box>
            ))}
        </Box>
    );
};
