import React, { ReactNode, useState, useEffect } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { labCatalog } from '../catalog/labCatalog';

interface LabContext {
    systemPrompt: string;
    documentContext: string;
    history: Array<{ role: string; content: string }>;
    mcpServers: Array<Record<string, unknown>>;
}

interface LabCopilotProviderProps {
    projectId: string;
    sessionId: string | null;
    children: ReactNode;
}

function getAuthToken(): string {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
}

const AGENT_URL = (import.meta as any).env?.VITE_LAB_AGENT_URL ?? 'http://localhost:8001';
const COPILOT_LICENCE = (import.meta as any).env?.VITE_LAB_COPILOT_LICENCE ?? '';

export const LabCopilotProvider: React.FC<LabCopilotProviderProps> = ({
    projectId,
    sessionId,
    children,
}) => {
    const [context, setContext] = useState<LabContext | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setContext(null);
            return;
        }

        const token = getAuthToken();

        fetch(`/api/lab/chat/${projectId}/sessions/${sessionId}/context`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        })
            .then(r => {
                if (!r.ok) throw new Error(`Context fetch failed: ${r.status}`);
                return r.json();
            })
            .then(setContext)
            .catch(err => {
                console.warn('[LabCopilotProvider] context fetch error', err);
                setContext({ systemPrompt: '', documentContext: '', history: [], mcpServers: [] });
            });
    }, [projectId, sessionId]);

    const token = getAuthToken();

    return (
        <CopilotKit
            runtimeUrl={`${AGENT_URL}/api/copilotkit`}
            headers={{ Authorization: `Bearer ${token}` }}
            properties={context ?? {}}
            a2ui={{ catalog: labCatalog }}
            publicApiKey="ck_pub_cc02d9f68adcf2891e362dec5c853b0d"
        >
            {children}
        </CopilotKit>
    );
};
