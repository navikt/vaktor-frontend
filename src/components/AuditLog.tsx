import { useState, useEffect } from 'react'
import { Table, Select, Loader, Alert, Heading, Button, Tag, HStack, VStack, Box } from '@navikt/ds-react'
import { AuditLog as AuditLogType, Vaktlag } from '../types/types'

const ACTION_LABELS: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'error' | 'neutral' }> = {
    SCHEDULE_DELETED: { label: 'Vakt slettet', variant: 'error' },
    BULK_SCHEDULES_DELETED: { label: 'Bulk-sletting', variant: 'error' },
    SCHEDULE_RESET: { label: 'Vakt tilbakestilt', variant: 'warning' },
    GROUP_CREATED: { label: 'Vaktlag opprettet', variant: 'success' },
    GROUP_UPDATED: { label: 'Vaktlag oppdatert', variant: 'info' },
    MEMBERS_ADDED: { label: 'Medlemmer lagt til', variant: 'success' },
    MEMBERS_REMOVED: { label: 'Medlemmer fjernet', variant: 'warning' },
    ROLE_ASSIGNED: { label: 'Rolle tildelt', variant: 'success' },
    ROLE_REMOVED: { label: 'Rolle fjernet', variant: 'warning' },
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
    schedule: 'Vakt',
    group: 'Vaktlag',
    user: 'Bruker',
}

const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('nb-NO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const formatDetails = (details: Record<string, unknown> | null): string => {
    if (!details) return '-'

    const parts: string[] = []

    if (details.user_name) parts.push(`Bruker: ${details.user_name}`)
    if (details.group_name) parts.push(`Vaktlag: ${details.group_name}`)
    if (details.role) parts.push(`Rolle: ${details.role}`)
    if (details.user_ids) parts.push(`Brukere: ${(details.user_ids as string[]).join(', ')}`)
    if (details.deleted_count) parts.push(`Slettet: ${details.deleted_count}`)
    if (details.from_level !== undefined && details.to_level !== undefined) {
        parts.push(`Nivå: ${details.from_level} -> ${details.to_level}`)
    }
    if (details.old_name && details.old_name !== details.group_name) {
        parts.push(`Gammelt navn: ${details.old_name}`)
    }
    if (details.type) parts.push(`Type: ${details.type}`)

    return parts.length > 0 ? parts.join(' | ') : JSON.stringify(details)
}

export default function AuditLogComponent() {
    const [audits, setAudits] = useState<AuditLogType[]>([])
    const [groups, setGroups] = useState<Vaktlag[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [selectedGroup, setSelectedGroup] = useState<string>('')
    const [selectedAction, setSelectedAction] = useState<string>('')
    const [selectedEntityType, setSelectedEntityType] = useState<string>('')
    const [limit, setLimit] = useState<number>(50)

    const fetchAudits = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams()
            if (selectedGroup) params.append('group_id', selectedGroup)
            if (selectedAction) params.append('action', selectedAction)
            if (selectedEntityType) params.append('entity_type', selectedEntityType)
            params.append('limit', limit.toString())

            const response = await fetch(`/api/audit?${params.toString()}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Kunne ikke hente audit-logger')
            }

            setAudits(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ukjent feil')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGroups = async () => {
        try {
            const response = await fetch('/api/groups_simple')
            const data = await response.json()
            if (response.ok) {
                setGroups(data)
            }
        } catch (err) {
            console.error('Error fetching groups:', err)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    useEffect(() => {
        fetchAudits()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedGroup, selectedAction, selectedEntityType, limit])

    const uniqueActions = Object.keys(ACTION_LABELS)

    return (
        <VStack gap="space-6" className="p-4">
            <Heading size="medium">Audit-logg</Heading>

            <HStack gap="space-4" wrap>
                <Select
                    label="Vaktlag"
                    size="small"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    style={{ minWidth: '200px' }}
                >
                    <option value="">Alle vaktlag</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </Select>

                <Select
                    label="Handling"
                    size="small"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    style={{ minWidth: '180px' }}
                >
                    <option value="">Alle handlinger</option>
                    {uniqueActions.map((action) => (
                        <option key={action} value={action}>
                            {ACTION_LABELS[action]?.label || action}
                        </option>
                    ))}
                </Select>

                <Select
                    label="Type"
                    size="small"
                    value={selectedEntityType}
                    onChange={(e) => setSelectedEntityType(e.target.value)}
                    style={{ minWidth: '150px' }}
                >
                    <option value="">Alle typer</option>
                    <option value="schedule">Vakt</option>
                    <option value="group">Vaktlag</option>
                    <option value="user">Bruker</option>
                </Select>

                <Select
                    label="Antall"
                    size="small"
                    value={limit.toString()}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    style={{ minWidth: '100px' }}
                >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </Select>

                <Box style={{ alignSelf: 'flex-end' }}>
                    <Button size="small" variant="secondary" onClick={fetchAudits}>
                        Oppdater
                    </Button>
                </Box>
            </HStack>

            {error && (
                <Alert variant="error" size="small">
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader size="large" />
                </div>
            ) : audits.length === 0 ? (
                <Alert variant="info" size="small">
                    Ingen audit-logger funnet
                </Alert>
            ) : (
                <Table size="small" zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                            <Table.HeaderCell>Handling</Table.HeaderCell>
                            <Table.HeaderCell>Type</Table.HeaderCell>
                            <Table.HeaderCell>Utfort av</Table.HeaderCell>
                            <Table.HeaderCell>Rolle</Table.HeaderCell>
                            <Table.HeaderCell>Detaljer</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {audits.map((audit) => {
                            const actionInfo = ACTION_LABELS[audit.action] || {
                                label: audit.action,
                                variant: 'neutral' as const,
                            }
                            return (
                                <Table.Row key={audit.id}>
                                    <Table.DataCell>{formatTimestamp(audit.timestamp)}</Table.DataCell>
                                    <Table.DataCell>
                                        <Tag variant={actionInfo.variant} size="small">
                                            {actionInfo.label}
                                        </Tag>
                                    </Table.DataCell>
                                    <Table.DataCell>{ENTITY_TYPE_LABELS[audit.entity_type] || audit.entity_type}</Table.DataCell>
                                    <Table.DataCell>{audit.user?.name || audit.changed_by}</Table.DataCell>
                                    <Table.DataCell>{audit.changed_by_role || '-'}</Table.DataCell>
                                    <Table.DataCell style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {formatDetails(audit.details)}
                                    </Table.DataCell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}
        </VStack>
    )
}
