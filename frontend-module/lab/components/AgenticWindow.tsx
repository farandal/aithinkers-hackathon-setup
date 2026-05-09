import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    TextField,
    IconButton,
    CircularProgress,
    Avatar,
    Button,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import ExtensionIcon from '@mui/icons-material/Extension';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import StopIcon from '@mui/icons-material/Stop';
import { useNotify } from 'react-admin';
import { useCopilotChatHeadless_c, useCoAgent } from '@copilotkit/react-core';
import { LabPanelRenderer } from '../catalog/LabPanelRenderer';

interface Document {
    id: string;
    name: string;
    original_name: string;
    file_type: string;
    file_size: number;
    is_active: boolean;
}

interface McpServer {
    id: string;
    name: string;
    transport_type: string;
    is_active: boolean;
}

interface ChatSession {
    id: string;
    title: string | null;
    created_at: string;
    metadata?: {
        selected_document_ids?: string[];
        selected_mcp_ids?: string[];
    };
}

interface AgenticWindowProps {
    projectId: string;
    projectName?: string;
    onSessionChange?: (sessionId: string | null) => void;
}

const API_BASE = '/api/lab';

async function apiFetch(url: string, options?: RequestInit) {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options?.headers ?? {}),
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
}

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

export const AgenticWindow: React.FC<AgenticWindowProps> = ({
    projectId,
    onSessionChange,
}) => {
    const notify = useNotify();

    // ── Documents ─────────────────────────────────────────────────────────────
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── MCP Servers ───────────────────────────────────────────────────────────
    const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
    const [selectedMcpIds, setSelectedMcpIds] = useState<string[]>([]);

    // ── Chat sessions ─────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ── CopilotKit (AG-UI) ────────────────────────────────────────────────────
    // `messages` is the non-deprecated AG-UI format array.
    // `sendMessage` is the non-deprecated submission function.
    const {
        messages,
        sendMessage: cpkSend,
        isLoading,
        stopGeneration,
    } = useCopilotChatHeadless_c();

    // Subscribe to agent state — panel data lives at state.a2uiPanel
    const { state: agentState } = useCoAgent<{ a2uiPanel?: unknown }>({ name: 'lab_agent' });
    const labPanel = agentState?.a2uiPanel ?? null;

    // Only user + assistant messages for the chat UI
    const chatMessages = (messages ?? []).filter(
        (m: any) => m.role === 'user' || m.role === 'assistant'
    );

    // ── Load data ─────────────────────────────────────────────────────────────

    const loadDocuments = useCallback(async () => {
        try {
            const res = await apiFetch(
                `${API_BASE}/document?filter=${encodeURIComponent(JSON.stringify({ lab_project_id: projectId }))}`
            );
            const json = await res.json();
            setDocuments(json.data ?? []);
        } catch { /* silent */ }
    }, [projectId]);

    const loadMcpServers = useCallback(async () => {
        try {
            const res = await apiFetch(
                `${API_BASE}/mcp-server?filter=${encodeURIComponent(JSON.stringify({ is_active: true }))}`
            );
            const json = await res.json();
            setMcpServers(json.data ?? []);
        } catch { /* silent */ }
    }, []);

    const loadSessions = useCallback(async () => {
        try {
            const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions`);
            const json = await res.json();
            setSessions(json.data ?? []);
        } catch { /* silent */ }
    }, [projectId]);

    useEffect(() => {
        loadDocuments();
        loadMcpServers();
        loadSessions();
    }, [loadDocuments, loadMcpServers, loadSessions]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages.length, isLoading]);

    // ── Session management ────────────────────────────────────────────────────

    const createNewSession = async () => {
        try {
            const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions`, {
                method: 'POST',
                body: JSON.stringify({
                    title: null,
                    selected_document_ids: selectedDocIds,
                    selected_mcp_ids: selectedMcpIds,
                }),
            });
            const json = await res.json();
            const session: ChatSession = json.data;
            setSessions(prev => [session, ...prev]);
            setActiveSession(session);
            onSessionChange?.(session.id);
        } catch {
            notify('Could not create session', { type: 'error' });
        }
    };

    const selectSession = (session: ChatSession) => {
        setActiveSession(session);
        setSelectedDocIds(session.metadata?.selected_document_ids ?? []);
        setSelectedMcpIds(session.metadata?.selected_mcp_ids ?? []);
        onSessionChange?.(session.id);
    };

    // ── Send message ──────────────────────────────────────────────────────────

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        let session = activeSession;

        if (!session) {
            try {
                const res = await apiFetch(`${API_BASE}/chat/${projectId}/sessions`, {
                    method: 'POST',
                    body: JSON.stringify({
                        title: null,
                        selected_document_ids: selectedDocIds,
                        selected_mcp_ids: selectedMcpIds,
                    }),
                });
                const json = await res.json();
                session = json.data as ChatSession;
                setSessions(prev => [session!, ...prev]);
                setActiveSession(session);
                onSessionChange?.(session!.id);
            } catch {
                notify('Could not create session', { type: 'error' });
                return;
            }
        } else {
            await apiFetch(`${API_BASE}/chat/${projectId}/sessions/${session.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    selected_document_ids: selectedDocIds,
                    selected_mcp_ids: selectedMcpIds,
                }),
            }).catch(() => {});
        }

        const content = inputValue.trim();
        setInputValue('');

        // Persist user message to Laravel
        await apiFetch(`${API_BASE}/chat/${projectId}/sessions/${session.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ role: 'user', content }),
        }).catch(() => {});

        // Send to agent via CopilotKit (AG-UI stream)
        await cpkSend({ id: crypto.randomUUID(), role: 'user', content } as any);
    };

    // Persist assistant message to Laravel once the stream finishes
    useEffect(() => {
        if (isLoading || !activeSession) return;
        const msgs = messages ?? [];
        const lastMsg = msgs[msgs.length - 1] as any;
        if (!lastMsg || lastMsg.role !== 'assistant') return;
        const content = getTextContent(lastMsg);
        if (!content) return;

        apiFetch(`${API_BASE}/chat/${projectId}/sessions/${activeSession.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ role: 'assistant', content }),
        }).catch(() => {});
    // Only run when isLoading flips to false
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading]);

    // ── Document upload ───────────────────────────────────────────────────────

    const uploadDocument = async (file: File) => {
        setUploading(true);
        try {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('lab_project_id', projectId);

            const res = await fetch(`${API_BASE}/document`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            notify('Document uploaded', { type: 'success' });
            await loadDocuments();
        } catch {
            notify('Upload failed', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    // ── Renderers ─────────────────────────────────────────────────────────────

    const renderMessage = (msg: any, i: number) => {
        const isUser = msg.role === 'user';
        const content = getTextContent(msg);
        if (!content) return null;
        return (
            <Box
                key={msg.id ?? i}
                sx={{
                    display: 'flex',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                    gap: 1,
                    mb: 2,
                    alignItems: 'flex-start',
                }}
            >
                <Avatar sx={{ bgcolor: isUser ? 'primary.main' : 'secondary.main', width: 32, height: 32 }}>
                    {isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                </Avatar>
                <Paper
                    elevation={0}
                    sx={{
                        p: 1.5,
                        maxWidth: '75%',
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

    // ── Layout ────────────────────────────────────────────────────────────────

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr 240px',
                height: 'calc(100vh - 120px)',
                gap: 1,
                p: 1,
                bgcolor: 'background.default',
            }}
        >
            {/* ── Left: Documents ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={600}>Documents</Typography>
                    <Box>
                        {uploading ? (
                            <CircularProgress size={18} />
                        ) : (
                            <Tooltip title="Upload document">
                                <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept=".pdf,.txt,.md,.docx,.csv"
                            onChange={e => e.target.files?.[0] && uploadDocument(e.target.files[0])}
                        />
                    </Box>
                </Box>
                <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
                    {documents.length === 0 && (
                        <ListItem><ListItemText secondary="No documents yet" /></ListItem>
                    )}
                    {documents.map(doc => (
                        <ListItem key={doc.id} dense disableGutters sx={{ px: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Checkbox
                                    size="small"
                                    edge="start"
                                    checked={selectedDocIds.includes(doc.id)}
                                    onChange={e => setSelectedDocIds(prev =>
                                        e.target.checked ? [...prev, doc.id] : prev.filter(id => id !== doc.id)
                                    )}
                                />
                            </ListItemIcon>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <DescriptionIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                                primary={doc.name}
                                primaryTypographyProps={{ variant: 'caption', noWrap: true }}
                            />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {selectedDocIds.length} selected
                    </Typography>
                </Box>
            </Paper>

            {/* ── Center: Chat ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Session selector */}
                <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ flex: 1 }}>
                        <InputLabel>Session</InputLabel>
                        <Select
                            label="Session"
                            value={activeSession?.id ?? ''}
                            onChange={e => {
                                const s = sessions.find(s => s.id === e.target.value);
                                if (s) selectSession(s);
                            }}
                        >
                            {sessions.map(s => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.title ?? new Date(s.created_at).toLocaleString()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={createNewSession}>
                        New
                    </Button>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                    {!activeSession && chatMessages.length === 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Box textAlign="center">
                                <SmartToyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography color="text.secondary">
                                    Start a new session or select an existing one
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {chatMessages.map((msg, i) => renderMessage(msg, i))}

                    {isLoading && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <SmartToyIcon fontSize="small" />
                            </Avatar>
                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}>
                                <CircularProgress size={14} />
                            </Paper>
                        </Box>
                    )}

                    <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        maxRows={4}
                        placeholder="Ask something…"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <IconButton color="error" onClick={stopGeneration}>
                            <StopIcon />
                        </IconButton>
                    ) : (
                        <IconButton color="primary" onClick={sendMessage} disabled={!inputValue.trim()}>
                            <SendIcon />
                        </IconButton>
                    )}
                </Box>
            </Paper>

            {/* ── Right: Tools + Panel ── */}
            <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight={600}>Tools (MCP)</Typography>
                </Box>
                <List dense sx={{ overflow: 'auto', py: 0 }}>
                    {mcpServers.length === 0 && (
                        <ListItem><ListItemText secondary="No MCP servers configured" /></ListItem>
                    )}
                    {mcpServers.map(server => (
                        <ListItem key={server.id} dense disableGutters sx={{ px: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Checkbox
                                    size="small"
                                    edge="start"
                                    checked={selectedMcpIds.includes(server.id)}
                                    onChange={e => setSelectedMcpIds(prev =>
                                        e.target.checked ? [...prev, server.id] : prev.filter(id => id !== server.id)
                                    )}
                                />
                            </ListItemIcon>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                                <ExtensionIcon fontSize="small" color="action" />
                            </ListItemIcon>
                            <ListItemText
                                primary={server.name}
                                secondary={server.transport_type}
                                primaryTypographyProps={{ variant: 'caption', noWrap: true }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItem>
                    ))}
                </List>

                {/* A2UI Panel area */}
                {labPanel && (
                    <>
                        <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider', borderBottom: '1px solid' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Agent Panel
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                            <LabPanelRenderer panel={labPanel as any} />
                        </Box>
                    </>
                )}

                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                        {selectedMcpIds.length} active
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default AgenticWindow;
