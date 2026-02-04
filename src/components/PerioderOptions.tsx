import { Dispatch, useEffect, useState } from 'react'
import { User } from '../types/types'
import { Table, Button } from '@navikt/ds-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MenuGridIcon } from '@navikt/aksel-icons'

const PerioderOptions = (props: { member: User; setItemData: Dispatch<User[]>; itemData: User[]; index: number }) => {
    const [error, setError] = useState('')
    const [groupOrderIndexes, setGroupOrderIndexes] = useState<number[]>([])

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.member.ressursnummer })

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

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Remove this user from the list
        const updated = props.itemData.filter((user) => user.ressursnummer !== props.member.ressursnummer)
        // Re-index group_order_index for remaining users (skip those with group_order_index === 100)
        let idx = 1
        for (let user of updated) {
            if (user.group_order_index !== 100) {
                user.group_order_index = idx
                idx++
            }
        }
        props.setItemData(updated)
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
    }

    return (
        <Table.Row key={props.member.name} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Table.DataCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MenuGridIcon title="Dra for å endre rekkefølge" />
                    <span>{props.index + 1}</span>
                </div>
            </Table.DataCell>
            <Table.HeaderCell scope="row">{props.member.id}</Table.HeaderCell>
            <Table.DataCell>{props.member.name}</Table.DataCell>
            <Table.DataCell>{props.member.role}</Table.DataCell>
            <Table.DataCell>
                <Button size="xsmall" variant="danger" onClick={handleRemove} onPointerDown={(e) => e.stopPropagation()}>
                    Fjern
                </Button>
            </Table.DataCell>
        </Table.Row>
    )
}

export default PerioderOptions
