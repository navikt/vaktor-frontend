import { Button, Table, Loader } from '@navikt/ds-react'
import { useEffect, useState, Dispatch } from 'react'
import { Vaktlag, User } from '../types/types'
import GroupOptions from './GroupOptions'

let today = Date.now() / 1000
//let today = 1668470400  // 15. November 2022 00:00:00

const assign_leader = async (group_id: string, setResponse: Dispatch<any>) => {
    await fetch(`/api/assign_leader/?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setResponse(data)
        })
}

const remove_leader = async (group_id: string, setResponse: Dispatch<any>) => {
    await fetch(`/api/remove_leader/?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setResponse(data)
        })
}

const mapLeaders = (leaders: User[]) =>
    leaders.map((leader, index) => {
        const globalRoles = leader.roles?.filter((r) => r.title) || []
        const groupRoles = leader.group_roles || []

        return (
            <div key={index} style={{ marginBottom: '6px', fontSize: '0.9em', lineHeight: '1.4' }}>
                <span style={{ fontWeight: '500' }}>{leader.name}</span>
                <span style={{ color: '#666', marginLeft: '4px' }}>({leader.id.toUpperCase()})</span>
                {globalRoles.length > 0 && (
                    <div style={{ fontSize: '0.85em', color: '#444' }}>{globalRoles.map((role) => role.title).join(', ')}</div>
                )}
                {groupRoles.length > 0 && (
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{groupRoles.map((gr) => `${gr.role.title} (${gr.group_name})`).join(', ')}</div>
                )}
            </div>
        )
    })

const mapMembers = (members: User[]) => {
    const rolePriority = ['vaktsjef', 'vakthaver']

    return members
        .filter((member) => !member.roles.some((role) => role.title === 'leveranseleder'))
        .sort((a, b) => {
            const aPriority = Math.min(...a.roles.map((r) => rolePriority.indexOf(r.title)).filter((i) => i !== -1), Infinity)
            const bPriority = Math.min(...b.roles.map((r) => rolePriority.indexOf(r.title)).filter((i) => i !== -1), Infinity)

            if (aPriority !== bPriority) return aPriority - bPriority

            return a.id.localeCompare(b.id)
        })
        .map((member, index) => {
            const globalRoles = member.roles?.filter((r) => r.title) || []
            const groupRoles = member.group_roles || []

            return (
                <div key={index} style={{ marginBottom: '6px', fontSize: '0.9em', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: '500' }}>{member.name}</span>
                    <span style={{ color: '#666', marginLeft: '4px' }}>({member.id.toUpperCase()})</span>
                    {globalRoles.length > 0 && (
                        <div style={{ fontSize: '0.85em', color: '#444' }}>{globalRoles.map((role) => role.title).join(', ')}</div>
                    )}
                    {groupRoles.length > 0 && (
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                            {groupRoles.map((gr) => `${gr.role.title} (${gr.group_name})`).join(', ')}
                        </div>
                    )}
                </div>
            )
        })
}

const Leveranseleder = () => {
    const [groupData, setgroupData] = useState<Vaktlag[]>([])
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)
    const [vaktsjef, setVaktsjef] = useState()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [groupsRes] = await Promise.all([fetch('/api/groups')])
                const groupsjson = await groupsRes.json()
                setgroupData(groupsjson)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [response, vaktsjef])

    if (loading === true) return <Loader></Loader>

    return (
        <Table
            style={{
                minWidth: '900px',
                backgroundColor: 'white',
                marginBottom: '3vh',
            }}
        >
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Leder(e)</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Medlemmer</Table.HeaderCell>
                    {/* <Table.HeaderCell scope="col">Sett leveranseleder</Table.HeaderCell> */}
                    <Table.HeaderCell scope="col">Velg vaktsjef</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {groupData
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((vaktlag: Vaktlag, i) => {
                        return (
                            <Table.Row key={i}>
                                <Table.HeaderCell scope="row" style={{ minWidth: '200px' }}>
                                    {vaktlag.name}
                                    <br />
                                    <span
                                        style={{
                                            fontWeight: 'normal',
                                            fontSize: '0.9em',
                                            display: 'inline-block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '100%',
                                            border: '1px solid #ccc',
                                            padding: '2px 5px',
                                            cursor: 'pointer',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                        onClick={() => navigator.clipboard.writeText(vaktlag.id)}
                                        title="Click to copy"
                                    >
                                        {vaktlag.id}
                                    </span>
                                    <br />
                                    <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>
                                        Koststed: <b>{vaktlag.koststed}</b>
                                    </span>
                                </Table.HeaderCell>

                                <Table.DataCell>
                                    {(() => {
                                        // Leveranseledere fra group_roles for dette vaktlaget
                                        const leveranseledere = vaktlag.members.filter((user: User) =>
                                            user.group_roles?.some((gr) => gr.group_id === vaktlag.id && gr.role.title === 'leveranseleder')
                                        )

                                        // Vaktsjefer fra group_roles for dette vaktlaget
                                        const vaktsjefer = vaktlag.members.filter((user: User) =>
                                            user.group_roles?.some((gr) => gr.group_id === vaktlag.id && gr.role.title === 'vaktsjef')
                                        )

                                        return (
                                            <>
                                                {leveranseledere.length > 0 && (
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                                                            Leveranseledere:
                                                        </div>
                                                        {mapLeaders(leveranseledere)}
                                                    </div>
                                                )}
                                                {vaktsjefer.length > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.85em', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                                                            Vaktsjefer:
                                                        </div>
                                                        {mapLeaders(vaktsjefer)}
                                                    </div>
                                                )}
                                                {leveranseledere.length === 0 && vaktsjefer.length === 0 && (
                                                    <div style={{ fontSize: '0.85em', color: '#999', fontStyle: 'italic' }}>Ingen ledere tildelt</div>
                                                )}
                                            </>
                                        )
                                    })()}
                                </Table.DataCell>

                                <Table.DataCell>{mapMembers(vaktlag.members)}</Table.DataCell>

                                {/* <Table.DataCell style={{ maxWidth: '150px' }}>
                                <div>
                                    <Button
                                        style={{
                                            height: '30px',
                                            marginBottom: '10px',
                                            minWidth: '210px',
                                        }}
                                        disabled
                                        onClick={() => {
                                            assign_leader(
                                                vaktlag.id,
                                                setResponse // setLoading
                                            )
                                        }}
                                    >
                                        Sett meg som leder
                                    </Button>
                                    <br />

                                    <Button
                                        style={{
                                            backgroundColor: '#f96c6c',
                                            height: '30px',
                                            minWidth: '210px',
                                        }}
                                        disabled
                                        onClick={() =>
                                            remove_leader(
                                                vaktlag.id,
                                                setResponse //setLoading
                                            )
                                        }
                                    >
                                        Fjern meg som leder
                                    </Button>
                                </div>
                            </Table.DataCell> */}
                                <Table.DataCell style={{ minWidth: '220px' }}>
                                    <GroupOptions
                                        user_list={vaktlag.members.filter(
                                            (user: User) => !user.roles.some((role) => role.title === 'leveranseleder')
                                        )}
                                        group_id={vaktlag.id}
                                        //setLoading={setLoading}
                                        setVaksjef={setVaktsjef}
                                    />
                                </Table.DataCell>
                            </Table.Row>
                        )
                    })}
            </Table.Body>
        </Table>
    )
}

export default Leveranseleder
