import { Dispatch, useCallback, useEffect, useState } from 'react'
import { User } from '../types/types'
import { Table } from '@navikt/ds-react'

const VaktlagMembers = (props: { member: User; setItemData: Dispatch<User[]>; itemData: User[]; groupId?: string }) => {
    const [error, setError] = useState('')
    const [groupOrderIndexes, setGroupOrderIndexes] = useState<number[]>([])

    // Finn riktig rolle basert på groupId
    const getRole = () => {
        if (!props.groupId) return props.member.role

        const groupRole = props.member.group_roles?.find((gr) => gr.group_id === props.groupId)
        return groupRole?.role?.title || props.member.role
    }

    useEffect(() => {
        props.itemData
            .map(
                (user) =>
                    user.group_order_index === props.member.group_order_index &&
                    user.ressursnummer != props.member.ressursnummer &&
                    user.group_order_index !== 100
            )
            .includes(true)
            ? setError('Duplikate indekser')
            : setError('')

        var indexList = props.itemData.map((user: User) => user.group_order_index!)
        setGroupOrderIndexes(indexList)
    }, [props, setGroupOrderIndexes])

    return (
        <Table.Row key={props.member.name}>
            <Table.DataCell>{props.member.name}</Table.DataCell>
            <Table.HeaderCell scope="row">{props.member.id}</Table.HeaderCell>
            <Table.DataCell>{getRole()}</Table.DataCell>
        </Table.Row>
    )
}

export default VaktlagMembers
