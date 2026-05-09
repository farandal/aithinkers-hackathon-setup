import React from 'react';
import { z } from 'zod';
import { createCatalog } from '@copilotkit/a2ui-renderer';
import { LabDataChart } from './components/LabDataChart';
import { LabResultTable } from './components/LabResultTable';
import { LabStatusCard } from './components/LabStatusCard';
import { LabIframeTool } from './components/LabIframeTool';

const labCatalogDefinitions = {
    LabDataChart: {
        description: 'Bar chart for numerical lab data (sensor readings, experiment results).',
        props: z.object({
            title: z.string().describe('Chart title'),
            unit:  z.string().optional().describe('Unit of measurement (e.g. °C, mV)'),
            data:  z.array(z.object({
                label: z.string(),
                value: z.number(),
            })).describe('Data points'),
        }),
    },
    LabResultTable: {
        description: 'Tabular display for multi-column lab results or comparisons.',
        props: z.object({
            title:   z.string().optional().describe('Table title'),
            columns: z.array(z.string()).describe('Column headers'),
            rows:    z.array(z.array(z.union([z.string(), z.number()]))).describe('Row data'),
        }),
    },
    LabStatusCard: {
        description: 'Status summary card for equipment, experiments, or project health.',
        props: z.object({
            title:   z.string().describe('Card title'),
            status:  z.enum(['active', 'warning', 'error', 'idle']).describe('Status level'),
            metrics: z.array(z.object({
                label: z.string(),
                value: z.string(),
            })).optional().describe('Key metrics to display'),
        }),
    },
    LabIframeTool: {
        description: 'Embedded interactive tool or simulation via iframe.',
        props: z.object({
            url:    z.string().describe('URL to embed'),
            title:  z.string().optional().describe('Tool title'),
            height: z.number().optional().describe('Frame height in pixels'),
        }),
    },
} as const;

export const labCatalog = createCatalog(labCatalogDefinitions, {
    LabDataChart:   ({ props }) => <LabDataChart {...(props as any)} />,
    LabResultTable: ({ props }) => <LabResultTable {...(props as any)} />,
    LabStatusCard:  ({ props }) => <LabStatusCard {...(props as any)} />,
    LabIframeTool:  ({ props }) => <LabIframeTool {...(props as any)} />,
});
