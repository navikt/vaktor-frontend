/*
Types to be passed as props in Timeline component
*/

export interface Group{
    id: number|string,
    title: string,
    rightTitle: string,
    stackItems?: boolean,
    height?: number
}

export interface Groups{
    groups: Group[]
}

export interface Item{
id: number|string,
  group: number|string,
  title: string,
  start_time: number,
  end_time: number,
  canMove: boolean,
  canResize: boolean,
  canChangeGroup: boolean,
}

export interface Items{
    items: Item[]
}


/*
Types retrieved from Vaktor-api
*/

export interface Vaktlag{ //groups
    name: string,
    phone: string, 
    slack: string,
    id: number|string
}

export interface Schedules{
    id: number|string,
    start_timestamp: string,
    end_timestamp: string,
    active_user_id: string,
    group_id: string|number
}

export interface User{
    id: number|string,
    group_id: string|number,
    name: string,
    role: string
}