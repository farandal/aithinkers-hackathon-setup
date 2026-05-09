import React from 'react';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig, IDashAutoAdminAttribute } from 'dash-auto-admin';
import { DASHAppConstants } from 'dash-constants';
import ExtensionIcon from '@mui/icons-material/Extension';

const Icon = ExtensionIcon as unknown as React.FC;

const TRANSPORT_TYPES = [
    { id: 'sse',    name: 'SSE (HTTP)' },
    { id: 'docker', name: 'Docker' },
    { id: 'stdio',  name: 'stdio' },
];

export const mcpServerSchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'General',
        attribute: 'name',
        label: 'Server Name',
        type: String,
        inList: true,
    },
    {
        tab: 'General',
        attribute: 'description',
        label: 'Description',
        type: 'textarea',
        inList: false,
    },
    {
        tab: 'General',
        attribute: 'is_active',
        label: 'Active',
        type: Boolean,
        inList: true,
    },
    {
        tab: 'Connection',
        attribute: 'transport_type',
        label: 'Transport Type',
        type: 'select',
        fieldProps: {
            choices: TRANSPORT_TYPES,
            defaultValue: 'sse',
        },
        inList: true,
    },
    {
        tab: 'Connection',
        attribute: 'url',
        label: 'URL (SSE endpoint)',
        type: String,
        inList: false,
    },
    {
        tab: 'Connection',
        attribute: 'config',
        label: 'Config (JSON)',
        type: 'json',
        inList: false,
    },
];

const McpServerResource: IDashAutoAdminResourceConfig = {
    roles: [
        DASHAppConstants.system.SYSTEM_ROLE,
        'TenancyAdmin',
        'Tenant',
    ],
    component: ResourceTemplate,
    trash: true,
    model: 'lab/mcp-server',
    label: 'MCP Servers',
    schema: mcpServerSchema,
    icon: <Icon />,
    group: 'Laboratory',

    menu: [
        {
            title: 'MCP Servers',
            redirect: '/lab/mcp-server',
        },
        {
            title: 'Trash',
            redirect: '/lab/mcp-server/trash',
        },
    ],

    mainAction: {
        title: 'Add MCP Server',
        mode: 'create',
        fn: 'virtualhash',
        redirect: 'inline/create',
    },

    view: true,
    create: true,
    edit: true,
    drawer: true,
    drawerOptions: {
        create: true,
        edit: true,
        view: true,
    },

    mutationMode: 'pessimistic',
    saveButtonAlwaysEnabled: true,
    formGroupMode: 'tabs',
    listProps: { storeKey: false },
    resetSelectedIdsOnLoad: true,
};

export default McpServerResource;
