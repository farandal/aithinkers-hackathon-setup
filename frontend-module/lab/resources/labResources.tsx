import React from 'react';
import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
import { LabChatProto } from '../components/LabChatProto';
import LabProjectResource from './labProjectResource';
import AgentConfigResource from './agentConfigResource';
import McpServerResource from './mcpServerResource';

const LabProjectResourceWithWindow: IDashAutoAdminResourceConfig = {
    ...LabProjectResource,
    showComponent: () => {
        const LabProjectShow = () => {
            const uuidMatch = window.location.pathname.match(
                /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
            );
            const id = uuidMatch?.[1] ?? '';
            return <LabChatProto projectId={id} />;
        };
        return <LabProjectShow />;
    },
    view: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: false,
    },
};

const LabResources: IDashAutoAdminResourceConfig[] = [
    LabProjectResourceWithWindow,
    AgentConfigResource,
    McpServerResource,
];

export default LabResources;
