/*
Types to be passed as props in Timeline component
*/

export interface Group {
    id: number | string
    title: string
    rightTitle: string
    stackItems?: boolean
    height?: number
}

export interface Groups {
    groups: Group[]
}

export interface Item {
    id: number | string
    group: number | string
    title: string
    start_time: number
    end_time: number
    canMove: boolean
    canResize: boolean
    canChangeGroup: boolean
}

export interface Items {
    items: Item[]
}

/*
Types retrieved from Vaktor-api
*/

export interface Vaktlag {
    //groups
    name: string
    phone: string
    slack: string
    id: string
    description: string
    type: string
    members: User[]
    leveranseleder: User[]
    vaktsjef: User[]
}

export interface Schedules {
    id: string
    start_timestamp: number
    end_timestamp: number
    user_id: string
    group_id: string
    approve_level: number
    group: Vaktlag
    user: User
    type: string
    cost: Cost[]
    vakter: Schedules[]
    audits: Audit[]
    is_double: boolean
}

export interface User {
    id: string
    name: string
    role: string
    email: string | undefined
    ressursnummer: string
    description: string
    groups: Vaktlag[]
    group_order_index?: number
    group_id: string
    ekstern: boolean
    contact_info: string
    is_admin: boolean
    roles: Roles[]
    bdm_koststeder: string
}

export interface Roles {
    id: string
    title: string
    description: string
}

export interface Audit {
    id: string
    schedule_id: string
    timestamp: string
    action: string
    changed_by: string
    user: User
}

export interface Cost {
    //groups
    id: string
    total_cost: number
    approver_id: string
    approver: User
    artskoder: Artskoder[]
    type_id: number
    order_id: number
    koststed: string
}

export interface Artskoder {
    //groups
    id: string
    cost_id: string
    type: string
    sum: string
    hours: string
}
