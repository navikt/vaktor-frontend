/*
Types to be passed as props in Timeline component
*/

export interface Group {
    id: number | string,
    title: string,
    rightTitle: string,
    stackItems?: boolean,
    height?: number
}

export interface Groups {
    groups: Group[]
}

export interface Item {
    id: number | string,
    group: number | string,
    title: string,
    start_time: number,
    end_time: number,
    canMove: boolean,
    canResize: boolean,
    canChangeGroup: boolean,
}

export interface Items {
    items: Item[]
}


/*
Types retrieved from Vaktor-api
*/

export interface Period {
    id: string,
    schedule_id: string,
    group_id: string,
    user_id: string,
    user: User | undefined,
    start_timestamp: number,
    end_timestamp: number,
    approve_level: number,
}

export interface Vaktlag { //groups
    name: string,
    phone: string,
    slack: string,
    id: string,
    description: string,
    type: string,
    members: User[],
    leaders: Leader[]
}

export interface Schedules {
    id: string,
    start_timestamp: number,
    end_timestamp: number,
    user_id: string,
    group_id: string,
    approve_level: number,
    group: Vaktlag,
    user: User,
    interruptions: Period[]
}

export interface User {
    id: string,
    name: string,
    role: string,
    email: string | undefined,
    ressursnummer: string,
    description: string,
    groups: Vaktlag[] | undefined,
}

export interface Leader {
    id: string,
    name: string,
    role: string,
    email: string | undefined,
}

export interface Artskoder {
    id: string,
    cost_id: string,
    artskode_morgen: number,
    artskode_kveld: number,
    artskode_dag: number,
    artskode_helg: number,
}


export interface Cost {
    id: string,
    schedule_id: string,
    artskoder: Artskoder,
    total_cost: number,
    godkjenner: User,
}