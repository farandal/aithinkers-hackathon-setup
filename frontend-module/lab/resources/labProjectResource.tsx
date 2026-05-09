import React from 'react';
import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import { IDashAutoAdminResourceConfig, IDashAutoAdminAttribute } from 'dash-auto-admin';
import { DASHAppConstants } from 'dash-constants';
import ScienceIcon from '@mui/icons-material/Science';

const Icon = ScienceIcon as unknown as React.FC;

export const labProjectSchema: IDashAutoAdminAttribute[] = [
    {
        tab: 'General',
        attribute: 'name',
        label: 'Project Name',
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
        tab: 'General',
        attribute: 'created_at',
        label: 'Created',
        type: Date,
        inList: true,
        inCreate: false,
        inEdit: false,
        readOnly: true,
    },
];

const LabProjectResource: IDashAutoAdminResourceConfig = {
    roles: [
        DASHAppConstants.system.SYSTEM_ROLE,
        'TenancyAdmin',
        'Tenant',
        'User',
    ],
    component: ResourceTemplate,
    trash: true,
    model: 'lab/project',
    label: 'Lab Projects',
    schema: labProjectSchema,
    icon: <Icon />,
    group: 'Laboratory',

    menu: [
        {
            title: 'Projects',
            redirect: '/lab/project',
        },
        {
            title: 'Trash',
            redirect: '/lab/project/trash',
        },
    ],

    mainAction: {
        title: 'New Project',
        mode: 'create',
        fn: 'virtualhash',
        redirect: 'inline/create',
    },

    view: true,
    create: true,
    edit: true,
    drawer: false,
    drawerOptions: {
        create: true,
        edit: true,
        view: false,
    },

    mutationMode: 'pessimistic',
    saveButtonAlwaysEnabled: true,
    formGroupMode: 'tabs',
    listProps: { storeKey: false },
    resetSelectedIdsOnLoad: true,
};

export default LabProjectResource;
