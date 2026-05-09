import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Avatar, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { CopilotKit, useCopilotChatHeadless_c, useCoAgent } from '@copilotkit/react-core';
import { labCatalog } from '../catalog/labCatalog';
import { LabPanelRenderer } from '../catalog/LabPanelRenderer';

const AGENT_URL = (import.meta as any).env?.VITE_LAB_AGENT_URL ?? 'http://localhost:8001';
const COPILOT_KEY = (import.meta as any).env?.VITE_LAB_COPILOT_LICENCE ?? '';

function getTextContent(msg: any): string {
    if (!msg) return '';
    if (typeof msg.content === 'string') return msg.content;
    if (Array.isArray(msg.content)) {
        return msg.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text || '')
            .join('');
    }
    return '';
}

const ChatMessage: React.FC<{ msg: any }> = ({ msg }) => {
    const isUser = msg.role === 'user';
    const content = getTextContent(msg);
    if (!content) return null;

    return (
        <Box sx={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 1, mb: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ bgcolor: isUser ? 'primary.main' : 'secondary.main', width: 32, height: 32, flexShrink: 0 }}>
                {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: isUser ? 'primary.light' : 'grey.100',
                    borderRadius: 2,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }}
            >
                <Typography variant="body2">{content}</Typography>
            </Paper>
        </Box>
    );
};

const LabChatInner: React.FC = () => {
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, isLoading, stopGeneration } = useCopilotChatHeadless_c();
    // 'default' matches what useCopilotChatHeadless_c uses internally; 'lab_agent' for panel state
    const { state: defaultState } = useCoAgent<{ a2uiPanel?: unknown }>({ name: 'default' });
    const { state: labState } = useCoAgent<{ a2uiPanel?: unknown }>({ name: 'lab_agent' });
    const state = defaultState?.a2uiPanel ? defaultState : labState;
    const panel = state?.a2uiPanel ?? null;

    const chatMessages = (messages ?? []).filter(
        (m: any) => m.role === 'user' || m.role === 'assistant'
    );

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length, isLoading]);

    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        const content = input.trim();
        setInput('');
        sendMessage({ id: crypto.randomUUID(), role: 'user', content } as any);
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 1.5, p: 1.5, bgcolor: 'background.default' }}>
            {/* Chat panel */}
            <Paper
                variant="outlined"
                sx={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2 }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon color="secondary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>Lab Assistant</Typography>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
                    {chatMessages.length === 0 && !isLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2, color: 'text.disabled' }}>
                            <SmartToyIcon sx={{ fontSize: 56 }} />
                            <Typography variant="body2" textAlign="center">
                                Ask me about your experiments, data analysis, or request visualizations.
                            </Typography>
                        </Box>
                    )}

                    {chatMessages.map((msg: any, i: number) => (
                        <ChatMessage key={msg.id ?? i} msg={msg} />
                    ))}

                    {isLoading && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <CircularProgress size={14} />
                            </Paper>
                        </Box>
                    )}

                    <div ref={endRef} />
                </Box>

                <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        maxRows={4}
                        placeholder="Ask something… (Enter to send, Shift+Enter for newline)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <IconButton color="error" onClick={stopGeneration} size="small">
                            <StopIcon />
                        </IconButton>
                    ) : (
                        <IconButton color="primary" onClick={handleSend} disabled={!input.trim()} size="small">
                            <SendIcon />
                        </IconButton>
                    )}
                </Box>
            </Paper>

            {/* Generative panel */}
            <Paper
                variant="outlined"
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 2 }}
            >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600}>Generated View</Typography>
                </Box>

                <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                    {!panel ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2, color: 'text.disabled' }}>
                            <AutoAwesomeIcon sx={{ fontSize: 56 }} />
                            <Typography variant="body2" textAlign="center">
                                Ask the assistant to show a chart, table, or status card and it will appear here.
                            </Typography>
                        </Box>
                    ) : (
                        <LabPanelRenderer panel={panel as any} />
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export const LabChatProto: React.FC<{ projectId: string }> = ({ projectId: _projectId }) => {
    return (
        <CopilotKit
            runtimeUrl={`${AGENT_URL}/api/copilotkit`}
            publicApiKey={COPILOT_KEY || undefined}
            properties={{}}
            a2ui={{ catalog: labCatalog }}
        >
            <LabChatInner />
        </CopilotKit>
    );
};

export default LabChatProto;
