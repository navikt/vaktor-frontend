import React, { useState, useEffect, useCallback } from 'react'
import {
    Table,
    Button,
    Select,
    Search,
    Loader,
    Alert,
    Heading,
    BodyShort,
    Label,
    Tabs,
    Tag,
    HStack,
    VStack,
    Box,
    TextField,
    Textarea,
} from '@navikt/ds-react'
import { PlusIcon, TrashIcon, PersonGroupIcon } from '@navikt/aksel-icons'
import { Vaktlag } from '../types/types'

interface GraphUser {
    id: string
    name: string
    email: string
    ekstern: boolean
    job_title: string
    department: string
    exists_in_vaktor: boolean
}

interface SelectedMember {
    id: string
    name: string
    email: string
    ekstern: boolean
    role: 'vakthaver' | 'vaktsjef' | 'leveranseleder'
    isNew: boolean
}

const GroupManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('create')
    const [groups, setGroups] = useState<Vaktlag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Create group state
    const [groupName, setGroupName] = useState('')
    const [groupDescription, setGroupDescription] = useState('')
    const [groupType, setGroupType] = useState('')
    const [groupKoststed, setGroupKoststed] = useState('')

    // User search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<GraphUser[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([])

    // Submit state
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/groups')
            if (!res.ok) throw new Error('Kunne ikke hente vaktlag')
            const data = await res.json()
            setGroups(data)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const res = await fetch(`/api/search_users_graph?query=${encodeURIComponent(query)}`)
            if (res.ok) {
                const data = await res.json()
                setSearchResults(data)
            } else {
                setSearchResults([])
            }
        } catch (err) {
            console.error('Search error:', err)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchQuery)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [searchQuery, searchUsers])

    const handleAddMember = (user: GraphUser, role: 'vakthaver' | 'vaktsjef' | 'leveranseleder') => {
        if (selectedMembers.some((m) => m.id === user.id)) {
            return
        }

        setSelectedMembers([
            ...selectedMembers,
            {
                id: user.id,
                name: user.name,
                email: user.email,
                ekstern: user.ekstern,
                role: role,
                isNew: !user.exists_in_vaktor,
            },
        ])
        setSearchQuery('')
        setSearchResults([])
    }

    const handleRemoveMember = (userId: string) => {
        setSelectedMembers(selectedMembers.filter((m) => m.id !== userId))
    }

    const handleUpdateMemberRole = (userId: string, role: 'vakthaver' | 'vaktsjef' | 'leveranseleder') => {
        setSelectedMembers(selectedMembers.map((m) => (m.id === userId ? { ...m, role } : m)))
    }

    const handleCreateGroup = async () => {
        if (!groupName || !groupType || !groupKoststed) {
            setError('Navn, type og koststed er pakrevd')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const newUsers = selectedMembers.filter((m) => m.isNew)
            if (newUsers.length > 0) {
                const createUsersRes = await fetch('/api/create_users_from_graph', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUsers.map((u) => u.id)),
                })
                if (!createUsersRes.ok) {
                    const err = await createUsersRes.json()
                    throw new Error(err.detail || 'Kunne ikke opprette nye brukere')
                }
            }

            const groupRes = await fetch(
                `/api/create_new_vaktlag?name=${encodeURIComponent(groupName)}&phone=&description=${encodeURIComponent(groupDescription)}&type=${encodeURIComponent(groupType)}&teamkatalog=`,
                { method: 'POST' }
            )

            if (!groupRes.ok) {
                const err = await groupRes.json()
                throw new Error(err.detail || 'Kunne ikke opprette vaktlag')
            }

            const groupData = await groupRes.json()

            let groupId = ''
            if (typeof groupData === 'string' && groupData.includes('id:')) {
                groupId = groupData.split('id:')[1].trim()
            } else if (groupData.id) {
                groupId = groupData.id
            }

            if (groupId && selectedMembers.length > 0) {
                const memberIds = selectedMembers.map((m) => m.id)
                const addMembersRes = await fetch(`/api/groups/${groupId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(memberIds),
                })

                if (!addMembersRes.ok) {
                    console.warn('Kunne ikke legge til medlemmer, men vaktlaget er opprettet')
                }

                for (const member of selectedMembers) {
                    try {
                        await fetch(`/api/groups/${groupId}/roles?user_id=${member.id}&role_title=${member.role}`, {
                            method: 'POST',
                        })
                    } catch (err) {
                        console.warn(`Kunne ikke tildele rolle ${member.role} til ${member.name}`)
                    }
                }
            }

            setSuccess(`Vaktlag "${groupName}" opprettet!`)

            setGroupName('')
            setGroupDescription('')
            setGroupType('')
            setGroupKoststed('')
            setSelectedMembers([])

            fetchGroups()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setGroupName('')
        setGroupDescription('')
        setGroupType('')
        setGroupKoststed('')
        setSelectedMembers([])
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader size="xlarge" title="Laster..." />
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
            <Heading size="large" style={{ marginBottom: '1.5rem' }}>
                Administrer vaktlag
            </Heading>

            {error && (
                <Alert variant="error" style={{ marginBottom: '1rem' }} closeButton onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" style={{ marginBottom: '1rem' }} closeButton onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="create" label="Opprett vaktlag" icon={<PlusIcon aria-hidden />} />
                    <Tabs.Tab value="list" label={`Alle vaktlag (${groups.length})`} icon={<PersonGroupIcon aria-hidden />} />
                </Tabs.List>

                <Tabs.Panel value="create" style={{ paddingTop: '1.5rem' }}>
                    {/* Vaktlag-detaljer */}
                    <Box padding="space-24" background="neutral-soft" borderRadius="8" style={{ marginBottom: '1.5rem' }}>
                        <Heading size="small" style={{ marginBottom: '1.5rem' }}>
                            Vaktlag-detaljer
                        </Heading>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem',
                            }}
                        >
                            <TextField label="Navn pa vaktlag" value={groupName} onChange={(e) => setGroupName(e.target.value)} size="medium" />

                            <Select label="Type" value={groupType} onChange={(e) => setGroupType(e.target.value)} size="medium">
                                <option value="">Velg type</option>
                                <option value="247">Dognkontinuerlig 24/7</option>
                                <option value="midlertidig">Midlertidig</option>
                            </Select>

                            <TextField label="Koststed" value={groupKoststed} onChange={(e) => setGroupKoststed(e.target.value)} size="medium" />
                        </div>

                        <Textarea
                            label="Beskrivelse"
                            description="Beskriv vaktlagets ansvarsomrade"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            minRows={2}
                            resize="vertical"
                        />
                    </Box>

                    {/* Legg til medlemmer */}
                    <Box padding="space-24" background="neutral-soft" borderRadius="8" style={{ marginBottom: '1.5rem' }}>
                        <Heading size="small" style={{ marginBottom: '0.5rem' }}>
                            Legg til medlemmer
                        </Heading>
                        <BodyShort size="small" style={{ marginBottom: '1.5rem', color: 'var(--a-text-subtle)' }}>
                            Sok etter brukere i NAV-katalogen. Brukere som ikke finnes i Vaktor vil bli opprettet automatisk.
                        </BodyShort>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Search
                                label="Sok etter bruker"
                                description="Skriv navn eller NAV-ident"
                                hideLabel={false}
                                value={searchQuery}
                                onChange={(value) => setSearchQuery(value)}
                                variant="simple"
                                size="medium"
                            />

                            {isSearching && (
                                <Box
                                    padding="space-16"
                                    background="default"
                                    borderRadius="8"
                                    shadow="dialog"
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        marginTop: '0.25rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Loader size="small" />
                                    </div>
                                </Box>
                            )}

                            {searchResults.length > 0 && !isSearching && (
                                <Box
                                    background="default"
                                    borderRadius="8"
                                    shadow="dialog"
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        marginTop: '0.25rem',
                                        maxHeight: '350px',
                                        overflow: 'auto',
                                    }}
                                >
                                    {searchResults.map((user) => {
                                        const isAlreadyAdded = selectedMembers.some((m) => m.id === user.id)
                                        return (
                                            <div
                                                key={user.id}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderBottom: '1px solid var(--a-border-subtle)',
                                                    backgroundColor: isAlreadyAdded ? 'var(--a-surface-subtle)' : 'transparent',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        gap: '1rem',
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                                            <Tag variant="neutral" size="xsmall">
                                                                {user.id.toUpperCase()}
                                                            </Tag>
                                                            {user.ekstern && (
                                                                <Tag variant="alt3" size="xsmall">
                                                                    Ekstern
                                                                </Tag>
                                                            )}
                                                            {!user.exists_in_vaktor && (
                                                                <Tag variant="alt1" size="xsmall">
                                                                    Ny i Vaktor
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        {user.department && (
                                                            <BodyShort size="small" style={{ color: 'var(--a-text-subtle)', marginTop: '0.25rem' }}>
                                                                {user.department}
                                                            </BodyShort>
                                                        )}
                                                    </div>

                                                    {isAlreadyAdded ? (
                                                        <Tag variant="success" size="small">
                                                            Lagt til
                                                        </Tag>
                                                    ) : (
                                                        <HStack gap="space-4">
                                                            <Button
                                                                variant="tertiary"
                                                                size="xsmall"
                                                                onClick={() => handleAddMember(user, 'vakthaver')}
                                                            >
                                                                Vakthaver
                                                            </Button>
                                                            <Button
                                                                variant="tertiary"
                                                                size="xsmall"
                                                                onClick={() => handleAddMember(user, 'vaktsjef')}
                                                            >
                                                                Vaktsjef
                                                            </Button>
                                                            <Button
                                                                variant="tertiary"
                                                                size="xsmall"
                                                                onClick={() => handleAddMember(user, 'leveranseleder')}
                                                            >
                                                                Leder
                                                            </Button>
                                                        </HStack>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </Box>
                            )}
                        </div>

                        {selectedMembers.length > 0 && (
                            <div>
                                <Label size="small" style={{ marginBottom: '0.5rem', display: 'block' }}>
                                    Valgte medlemmer ({selectedMembers.length})
                                </Label>
                                <Box background="default" borderRadius="8" style={{ overflow: 'hidden' }}>
                                    <Table size="small" zebraStripes>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                                <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                                                <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                                                <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                                                <Table.HeaderCell scope="col" style={{ width: '50px' }}></Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {selectedMembers.map((member) => (
                                                <Table.Row key={member.id}>
                                                    <Table.DataCell>
                                                        <span style={{ fontWeight: 500 }}>{member.name}</span>
                                                        {member.ekstern && (
                                                            <Tag variant="alt3" size="xsmall" style={{ marginLeft: '0.5rem' }}>
                                                                Ekstern
                                                            </Tag>
                                                        )}
                                                    </Table.DataCell>
                                                    <Table.DataCell>
                                                        <code style={{ fontSize: '0.875rem' }}>{member.id.toUpperCase()}</code>
                                                    </Table.DataCell>
                                                    <Table.DataCell>
                                                        <Select
                                                            label="Rolle"
                                                            hideLabel
                                                            size="small"
                                                            value={member.role}
                                                            onChange={(e) =>
                                                                handleUpdateMemberRole(
                                                                    member.id,
                                                                    e.target.value as 'vakthaver' | 'vaktsjef' | 'leveranseleder'
                                                                )
                                                            }
                                                        >
                                                            <option value="vakthaver">Vakthaver</option>
                                                            <option value="vaktsjef">Vaktsjef</option>
                                                            <option value="leveranseleder">Leveranseleder</option>
                                                        </Select>
                                                    </Table.DataCell>
                                                    <Table.DataCell>
                                                        {member.isNew ? (
                                                            <Tag variant="alt1" size="small">
                                                                Opprettes
                                                            </Tag>
                                                        ) : (
                                                            <Tag variant="success" size="small">
                                                                Finnes
                                                            </Tag>
                                                        )}
                                                    </Table.DataCell>
                                                    <Table.DataCell>
                                                        <Button
                                                            variant="tertiary-neutral"
                                                            size="small"
                                                            icon={<TrashIcon aria-hidden />}
                                                            onClick={() => handleRemoveMember(member.id)}
                                                        />
                                                    </Table.DataCell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                </Box>
                            </div>
                        )}
                    </Box>

                    {/* Handlingsknapper */}
                    <HStack gap="space-16">
                        <Button
                            variant="primary"
                            onClick={handleCreateGroup}
                            loading={isSubmitting}
                            disabled={!groupName || !groupType || !groupKoststed}
                        >
                            Opprett vaktlag
                        </Button>
                        <Button variant="tertiary" onClick={resetForm}>
                            Nullstill
                        </Button>
                    </HStack>
                </Tabs.Panel>

                <Tabs.Panel value="list" style={{ paddingTop: '1.5rem' }}>
                    {groups.length > 0 ? (
                        <Box background="default" borderRadius="8" style={{ overflow: 'hidden' }}>
                            <Table zebraStripes>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Type</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Telefon</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Medlemmer</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Koststed</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {groups.map((group) => (
                                        <Table.Row key={group.id}>
                                            <Table.DataCell>
                                                <strong>{group.name}</strong>
                                            </Table.DataCell>
                                            <Table.DataCell>
                                                <Tag variant={group.type === '247' ? 'info' : 'neutral'} size="small">
                                                    {group.type === '247' ? '24/7' : group.type || '-'}
                                                </Tag>
                                            </Table.DataCell>
                                            <Table.DataCell>{group.phone || '-'}</Table.DataCell>
                                            <Table.DataCell>{group.members?.length || 0}</Table.DataCell>
                                            <Table.DataCell>{group.koststed || '-'}</Table.DataCell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </Box>
                    ) : (
                        <Box padding="space-24" background="neutral-soft" borderRadius="8" style={{ textAlign: 'center' }}>
                            <BodyShort>Ingen vaktlag funnet</BodyShort>
                        </Box>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    )
}

export default GroupManagement
