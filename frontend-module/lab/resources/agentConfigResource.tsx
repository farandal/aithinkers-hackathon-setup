import React from 'react';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig, IDashAutoAdminAttribute } from 'dash-auto-admin';
import { DASHAppConstants } from 'dash-constants';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const Icon = SmartToyIcon as unknown as React.FC;

const AI_PROVIDERS = [
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'openai',    name: 'OpenAI' },
];

const ANTHROPIC_MODELS = [
    { id: 'claude-opus-4-7',          name: 'Claude Opus 4.7' },
    { id: 'claude-sonnet-4-6',        name: 'Claude Sonnet 4.6' },
    { id: 'claude-haiku-4-5-20251001',name: 'Claude Haiku 4.5' },
];

export const agentConfigSchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'Provider',
        attribute: 'provider',
        label: 'AI Provider',
        type: 'select',
        fieldProps: {
            choices: AI_PROVIDERS,
            defaultValue: 'anthropic',
        },
        inList: true,
    },
    {
        tab: 'Provider',
        attribute: 'model',
        label: 'Model',
        type: 'select',
        fieldProps: {
            choices: ANTHROPIC_MODELS,
            defaultValue: 'claude-sonnet-4-6',
        },
        inList: true,
    },
    {
        tab: 'Provider',
        attribute: 'is_active',
        label: 'Active',
        type: Boolean,
        inList: true,
    },
    {
        tab: 'Instructions',
        attribute: 'system_prompt',
        label: 'System Prompt',
        type: 'textarea',
        inList: false,
        fieldProps: { rows: 8 },
    },
    {
        tab: 'Instructions',
        attribute: 'instructions',
        label: 'Additional Instructions',
        type: 'textarea',
        inList: false,
        fieldProps: { rows: 6 },
    },
];

const AgentConfigResource: IDashAutoAdminResourceConfig = {
    roles: [
        DASHAppConstants.system.SYSTEM_ROLE,
        'TenancyAdmin',
        'Tenant',
    ],
    component: ResourceTemplate,
    model: 'lab/agent-config',
    label: 'AI Configuration',
    schema: agentConfigSchema,
    icon: <Icon />,
    group: 'Laboratory',

    menu: [
        {
            title: 'AI Config',
            redirect: '/lab/agent-config',
        },
    ],

    mainAction: {
        title: 'Configure AI',
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
};

export default AgentConfigResource;
