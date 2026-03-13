import React, { useState, useEffect, useCallback } from 'react'
import { Table, Button, Select, Search, Loader, Alert, Heading, BodyShort, Tabs, Tag, HStack, Box, TextField, Textarea } from '@navikt/ds-react'
import { PlusIcon, TrashIcon, PersonGroupIcon, PencilIcon, PhoneIcon } from '@navikt/aksel-icons'
import { Vaktlag } from '../types/types'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

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

interface GroupForm {
    name: string
    description: string
    type: string
    phone: string
    koststed: string
}

const emptyForm: GroupForm = { name: '', description: '', type: '', phone: '', koststed: '' }

const VaktlagAdmin: React.FC = () => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const { user } = useAuth()

    const [activeTab, setActiveTab] = useState('list')
    const [groups, setGroups] = useState<Vaktlag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Create state
    const [createForm, setCreateForm] = useState<GroupForm>(emptyForm)
    const [createMembers, setCreateMembers] = useState<SelectedMember[]>([])
    const [isCreating, setIsCreating] = useState(false)

    // Edit state
    const [editingGroup, setEditingGroup] = useState<Vaktlag | null>(null)
    const [editForm, setEditForm] = useState<GroupForm>(emptyForm)
    const [editMembers, setEditMembers] = useState<SelectedMember[]>([])
    const [isUpdating, setIsUpdating] = useState(false)

    // User search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<GraphUser[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [searchTarget, setSearchTarget] = useState<'create' | 'edit'>('create')

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async (): Promise<Vaktlag[]> => {
        setLoading(true)
        try {
            const res = await fetch('/api/groups')
            if (!res.ok) throw new Error('Kunne ikke hente vaktlag')
            const data: Vaktlag[] = await res.json()
            const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
            setGroups(sorted)
            return sorted
        } catch (err) {
            setError((err as Error).message)
            return []
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
            setSearchResults(res.ok ? await res.json() : [])
        } catch {
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }, [])

    useEffect(() => {
        const t = setTimeout(() => searchUsers(searchQuery), 300)
        return () => clearTimeout(t)
    }, [searchQuery, searchUsers])

    const addMemberToCreate = (user: GraphUser, role: 'vakthaver' | 'vaktsjef' | 'leveranseleder') => {
        if (createMembers.some((m) => m.id === user.id)) return
        setCreateMembers((prev) => [
            ...prev,
            { id: user.id, name: user.name, email: user.email, ekstern: user.ekstern, role, isNew: !user.exists_in_vaktor },
        ])
        setSearchQuery('')
        setSearchResults([])
    }

    const addMemberToEdit = async (user: GraphUser, role: 'vakthaver' | 'vaktsjef' | 'leveranseleder') => {
        if (!editingGroup || editMembers.some((m) => m.id === user.id)) return
        const member: SelectedMember = {
            id: user.id,
            name: user.name,
            email: user.email,
            ekstern: user.ekstern,
            role,
            isNew: !user.exists_in_vaktor,
        }
        setEditMembers((prev) => [...prev, member])
        setSearchQuery('')
        setSearchResults([])
        try {
            if (member.isNew) {
                await fetch('/api/create_users_from_graph', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([member.id]),
                })
            }
            await fetch(`/api/groups/${editingGroup.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([member.id]),
            })
            await fetch(`/api/groups/${editingGroup.id}/roles?user_id=${member.id}&role_title=${role}`, { method: 'POST' })
        } catch (err) {
            console.warn('Kunne ikke lagre medlem', err)
        }
    }

    const removeEditMember = async (userId: string) => {
        if (!editingGroup) return
        setEditMembers((prev) => prev.filter((m) => m.id !== userId))
        try {
            await fetch(`/api/groups/${editingGroup.id}/members?user_id=${userId}`, { method: 'DELETE' })
        } catch (err) {
            console.warn('Kunne ikke fjerne medlem', err)
        }
    }

    const updateEditMemberRole = async (userId: string, role: 'vakthaver' | 'vaktsjef' | 'leveranseleder') => {
        if (!editingGroup) return
        setEditMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)))
        try {
            await fetch(`/api/groups/${editingGroup.id}/roles?user_id=${userId}&role_title=${role}`, { method: 'POST' })
        } catch (err) {
            console.warn('Kunne ikke oppdatere rolle', err)
        }
    }

    const handleCreateGroup = async () => {
        if (!createForm.name || !createForm.type) {
            setError('Navn og type er påkrevd')
            return
        }
        setIsCreating(true)
        setError(null)
        try {
            const newUsers = createMembers.filter((m) => m.isNew)
            if (newUsers.length > 0) {
                const res = await fetch('/api/create_users_from_graph', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUsers.map((u) => u.id)),
                })
                if (!res.ok) throw new Error((await res.json()).detail || 'Kunne ikke opprette nye brukere')
            }

            const groupRes = await fetch(
                `/api/create_new_vaktlag?name=${encodeURIComponent(createForm.name)}&phone=${encodeURIComponent(createForm.phone)}&description=${encodeURIComponent(createForm.description)}&type=${encodeURIComponent(createForm.type)}&koststed=${encodeURIComponent(createForm.koststed)}&teamkatalog=`,
                { method: 'POST' }
            )
            if (!groupRes.ok) throw new Error((await groupRes.json()).detail || 'Kunne ikke opprette vaktlag')

            const groupData = await groupRes.json()
            const groupId: string =
                groupData.id || (typeof groupData === 'string' && groupData.includes('id:') ? groupData.split('id:')[1].trim() : '')

            if (groupId && createMembers.length > 0) {
                await fetch(`/api/groups/${groupId}/members`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(createMembers.map((m) => m.id)),
                })
                for (const member of createMembers) {
                    await fetch(`/api/groups/${groupId}/roles?user_id=${member.id}&role_title=${member.role}`, { method: 'POST' })
                }
            }

            setSuccess(`Vaktlag "${createForm.name}" opprettet!`)
            setCreateForm(emptyForm)
            setCreateMembers([])
            await fetchGroups()
            setActiveTab('list')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsCreating(false)
        }
    }

    const startEdit = (group: Vaktlag) => {
        setEditingGroup(group)
        const koststedVal = Array.isArray(group.koststed) ? group.koststed.join(', ') : group.koststed || ''
        setEditForm({
            name: group.name,
            description: group.description || '',
            type: group.type || '',
            phone: group.phone || '',
            koststed: koststedVal,
        })
        const currentMembers: SelectedMember[] = (group.members || []).map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email || '',
            ekstern: m.ekstern,
            role: (m.group_roles?.find((gr) => gr.group_id === group.id)?.role?.title as 'vakthaver' | 'vaktsjef' | 'leveranseleder') || 'vakthaver',
            isNew: false,
        }))
        setEditMembers(currentMembers)
        setSearchQuery('')
        setSearchResults([])
        setSearchTarget('edit')
        setActiveTab('edit')
    }

    const handleUpdateGroup = async () => {
        if (!editingGroup || !editForm.name) {
            setError('Navn er påkrevd')
            return
        }
        setIsUpdating(true)
        setError(null)
        try {
            const res = await fetch(`/api/update_vaktlag?group_id=${editingGroup.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editForm.name,
                    phone: editForm.phone,
                    description: editForm.description,
                    type: editForm.type,
                    koststed: editForm.koststed,
                }),
            })
            if (!res.ok) throw new Error((await res.json()).detail || 'Kunne ikke oppdatere vaktlag')
            setSuccess(`Vaktlag "${editForm.name}" oppdatert!`)
            const updated = await fetchGroups()
            const refreshed = updated.find((g) => g.id === editingGroup.id)
            if (refreshed) {
                setEditingGroup(refreshed)
                const koststedVal = Array.isArray(refreshed.koststed) ? refreshed.koststed.join(', ') : refreshed.koststed || ''
                setEditForm({
                    name: refreshed.name,
                    description: refreshed.description || '',
                    type: refreshed.type || '',
                    phone: refreshed.phone || '',
                    koststed: koststedVal,
                })
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsUpdating(false)
        }
    }

    const renderMemberSection = (target: 'create' | 'edit') => {
        const isEdit = target === 'edit'
        const members = isEdit ? editMembers : createMembers
        const activeForSearch = searchTarget === target

        return (
            <Box padding="space-24" background="neutral-soft" borderRadius="8" style={{ marginBottom: '1.5rem' }}>
                <Heading size="small" style={{ marginBottom: '0.5rem' }}>
                    {isEdit ? 'Administrer medlemmer' : 'Legg til medlemmer'}
                </Heading>
                <BodyShort size="small" style={{ marginBottom: '1.5rem', color: 'var(--a-text-subtle)' }}>
                    Søk etter brukere i NAV-katalogen. Nye brukere opprettes automatisk i Vaktor.
                </BodyShort>

                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search
                        label="Søk etter bruker"
                        description="Skriv navn eller NAV-ident"
                        hideLabel={false}
                        value={activeForSearch ? searchQuery : ''}
                        onChange={(value) => {
                            setSearchTarget(target)
                            setSearchQuery(value)
                        }}
                        onFocus={() => setSearchTarget(target)}
                        variant="simple"
                        size="medium"
                    />

                    {isSearching && activeForSearch && (
                        <Box
                            padding="space-16"
                            background="default"
                            borderRadius="8"
                            shadow="dialog"
                            style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '0.25rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Loader size="small" />
                            </div>
                        </Box>
                    )}

                    {searchResults.length > 0 && !isSearching && activeForSearch && (
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
                                const isAdded = members.some((m) => m.id === user.id)
                                return (
                                    <div
                                        key={user.id}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: '1px solid var(--a-border-subtle)',
                                            backgroundColor: isAdded ? 'var(--a-surface-subtle)' : 'transparent',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
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
                                            {isAdded ? (
                                                <Tag variant="success" size="small">
                                                    Lagt til
                                                </Tag>
                                            ) : (
                                                <HStack gap="space-4">
                                                    <Button
                                                        variant="tertiary"
                                                        size="xsmall"
                                                        onClick={() =>
                                                            isEdit ? addMemberToEdit(user, 'vakthaver') : addMemberToCreate(user, 'vakthaver')
                                                        }
                                                    >
                                                        Vakthaver
                                                    </Button>
                                                    <Button
                                                        variant="tertiary"
                                                        size="xsmall"
                                                        onClick={() =>
                                                            isEdit ? addMemberToEdit(user, 'vaktsjef') : addMemberToCreate(user, 'vaktsjef')
                                                        }
                                                    >
                                                        Vaktsjef
                                                    </Button>
                                                    <Button
                                                        variant="tertiary"
                                                        size="xsmall"
                                                        onClick={() =>
                                                            isEdit
                                                                ? addMemberToEdit(user, 'leveranseleder')
                                                                : addMemberToCreate(user, 'leveranseleder')
                                                        }
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

                {members.length > 0 && (
                    <Box background="default" borderRadius="8" style={{ overflow: 'hidden' }}>
                        <Table size="small" zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                                    <Table.HeaderCell scope="col" style={{ width: '50px' }}></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {members.map((member) => (
                                    <Table.Row key={member.id}>
                                        <Table.DataCell>
                                            <span style={{ fontWeight: 500 }}>{member.name}</span>
                                            {member.ekstern && (
                                                <Tag variant="alt3" size="xsmall" style={{ marginLeft: '0.5rem' }}>
                                                    Ekstern
                                                </Tag>
                                            )}
                                            {member.isNew && !isEdit && (
                                                <Tag variant="alt1" size="xsmall" style={{ marginLeft: '0.5rem' }}>
                                                    Opprettes
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
                                                onChange={(e) => {
                                                    const role = e.target.value as 'vakthaver' | 'vaktsjef' | 'leveranseleder'
                                                    if (isEdit) {
                                                        updateEditMemberRole(member.id, role)
                                                    } else {
                                                        setCreateMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)))
                                                    }
                                                }}
                                            >
                                                <option value="vakthaver">Vakthaver</option>
                                                <option value="vaktsjef">Vaktsjef</option>
                                                <option value="leveranseleder">Leveranseleder</option>
                                            </Select>
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <Button
                                                variant="tertiary-neutral"
                                                size="small"
                                                icon={<TrashIcon aria-hidden />}
                                                onClick={() => {
                                                    if (isEdit) {
                                                        removeEditMember(member.id)
                                                    } else {
                                                        setCreateMembers((prev) => prev.filter((m) => m.id !== member.id))
                                                    }
                                                }}
                                            />
                                        </Table.DataCell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </Box>
                )}
            </Box>
        )
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader size="xlarge" title="Laster..." />
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
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
                    <Tabs.Tab value="list" label={`Vaktlag (${groups.length})`} icon={<PersonGroupIcon aria-hidden />} />
                    <Tabs.Tab value="create" label="Opprett nytt" icon={<PlusIcon aria-hidden />} />
                    {editingGroup && <Tabs.Tab value="edit" label={`Rediger: ${editingGroup.name}`} icon={<PencilIcon aria-hidden />} />}
                </Tabs.List>

                {/* OVERSIKT */}
                <Tabs.Panel value="list" style={{ paddingTop: '1.5rem' }}>
                    {groups.length > 0 ? (
                        (() => {
                            const myGroups = groups.filter((g) =>
                                (g.members || []).some(
                                    (u) =>
                                        u.id.toLowerCase() === user.id.toLowerCase() &&
                                        u.group_roles?.some((gr) => gr.group_id === g.id && gr.role.title === 'leveranseleder')
                                )
                            )
                            const otherGroups = groups.filter((g) => !myGroups.includes(g))

                            const renderRows = (list: Vaktlag[], highlight: boolean) =>
                                list.map((group) => {
                                    const leveranseledere = (group.members || []).filter((u) =>
                                        u.group_roles?.some((gr) => gr.group_id === group.id && gr.role.title === 'leveranseleder')
                                    )
                                    const vaktsjefer = (group.members || []).filter((u) =>
                                        u.group_roles?.some((gr) => gr.group_id === group.id && gr.role.title === 'vaktsjef')
                                    )
                                    const koststed = Array.isArray(group.koststed) ? group.koststed.join(', ') : group.koststed

                                    return (
                                        <Table.Row
                                            key={group.id}
                                            style={highlight ? { backgroundColor: isDarkMode ? '#1e3a28' : '#e8f5eb' } : undefined}
                                        >
                                            <Table.HeaderCell scope="row" style={{ minWidth: '180px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        flexWrap: 'wrap',
                                                        marginBottom: '0.2rem',
                                                    }}
                                                >
                                                    <strong>{group.name}</strong>
                                                    <Tag variant={group.type === 'Døgnkontinuerlig (24/7)' ? 'info' : 'neutral'} size="xsmall">
                                                        {group.type || '-'}
                                                    </Tag>
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        fontSize: '0.8em',
                                                        color: 'var(--a-text-subtle)',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    {group.phone && (
                                                        <span
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                border: '1px solid var(--a-border-subtle)',
                                                                borderRadius: '4px',
                                                                padding: '1px 6px',
                                                                fontSize: '0.85em',
                                                                backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                                                            }}
                                                        >
                                                            <PhoneIcon aria-hidden fontSize="0.9em" />
                                                            {group.phone}
                                                        </span>
                                                    )}
                                                    <span
                                                        style={{ cursor: 'pointer', borderBottom: '1px dashed var(--a-border-subtle)' }}
                                                        onClick={() => navigator.clipboard.writeText(group.id)}
                                                        title="Klikk for å kopiere ID"
                                                    >
                                                        {group.id}
                                                    </span>
                                                </div>
                                            </Table.HeaderCell>
                                            <Table.DataCell>{koststed || '-'}</Table.DataCell>
                                            <Table.DataCell style={{ minWidth: '160px' }}>
                                                <div style={{ fontSize: '0.875em' }}>
                                                    {leveranseledere.length === 0 && (
                                                        <Tag variant="warning" size="xsmall">
                                                            Mangler leder
                                                        </Tag>
                                                    )}
                                                    {leveranseledere.map((u) => (
                                                        <div key={u.id}>{u.name}</div>
                                                    ))}
                                                    {vaktsjefer.map((u) => (
                                                        <div key={u.id} style={{ color: isDarkMode ? '#b0b0b0' : '#666' }}>
                                                            {u.name}{' '}
                                                            <Tag variant="neutral" size="xsmall">
                                                                vaktsjef
                                                            </Tag>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Table.DataCell>
                                            <Table.DataCell>{group.members?.length || 0}</Table.DataCell>
                                            <Table.DataCell>
                                                <Button
                                                    variant="tertiary"
                                                    size="small"
                                                    icon={<PencilIcon aria-hidden />}
                                                    onClick={() => startEdit(group)}
                                                >
                                                    Rediger
                                                </Button>
                                            </Table.DataCell>
                                        </Table.Row>
                                    )
                                })

                            const tableHeader = (
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Koststed</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Ledere</Table.HeaderCell>
                                        <Table.HeaderCell scope="col">Medlemmer</Table.HeaderCell>
                                        <Table.HeaderCell scope="col"></Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                            )

                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    {myGroups.length > 0 && (
                                        <div>
                                            <Heading size="xsmall" style={{ marginBottom: '0.75rem', color: isDarkMode ? '#6fcf97' : '#1a6633' }}>
                                                Vaktlag jeg er leder for ({myGroups.length})
                                            </Heading>
                                            <Box background="default" borderRadius="8" style={{ overflow: 'auto' }}>
                                                <Table zebraStripes>
                                                    {tableHeader}
                                                    <Table.Body>{renderRows(myGroups, true)}</Table.Body>
                                                </Table>
                                            </Box>
                                        </div>
                                    )}
                                    {otherGroups.length > 0 && (
                                        <div>
                                            <Heading size="xsmall" style={{ marginBottom: '0.75rem' }}>
                                                Andre vaktlag ({otherGroups.length})
                                            </Heading>
                                            <Box background="default" borderRadius="8" style={{ overflow: 'auto' }}>
                                                <Table zebraStripes>
                                                    {tableHeader}
                                                    <Table.Body>{renderRows(otherGroups, false)}</Table.Body>
                                                </Table>
                                            </Box>
                                        </div>
                                    )}
                                </div>
                            )
                        })()
                    ) : (
                        <Box padding="space-24" background="neutral-soft" borderRadius="8" style={{ textAlign: 'center' }}>
                            <BodyShort>Ingen vaktlag funnet</BodyShort>
                        </Box>
                    )}
                </Tabs.Panel>

                {/* OPPRETT */}
                <Tabs.Panel value="create" style={{ paddingTop: '1.5rem' }}>
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
                            <TextField
                                label="Navn på vaktlag"
                                value={createForm.name}
                                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                            />
                            <Select label="Type" value={createForm.type} onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}>
                                <option value="">Velg type</option>
                                <option value="Døgnkontinuerlig (24/7)">Døgnkontinuerlig (24/7)</option>
                                <option value="Midlertidlig">Midlertidlig</option>
                            </Select>
                            <TextField
                                label="Telefonnummer"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                            />
                            <TextField
                                label="Koststed"
                                value={createForm.koststed}
                                onChange={(e) => setCreateForm((f) => ({ ...f, koststed: e.target.value }))}
                            />
                        </div>
                        <Textarea
                            label="Beskrivelse"
                            description="Beskriv vaktlagets ansvarsområde"
                            value={createForm.description}
                            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                            minRows={2}
                            resize="vertical"
                        />
                    </Box>

                    {renderMemberSection('create')}

                    <HStack gap="space-16">
                        <Button variant="primary" onClick={handleCreateGroup} loading={isCreating} disabled={!createForm.name || !createForm.type}>
                            Opprett vaktlag
                        </Button>
                        <Button
                            variant="tertiary"
                            onClick={() => {
                                setCreateForm(emptyForm)
                                setCreateMembers([])
                            }}
                        >
                            Nullstill
                        </Button>
                    </HStack>
                </Tabs.Panel>

                {/* REDIGER */}
                {editingGroup && (
                    <Tabs.Panel value="edit" style={{ paddingTop: '1.5rem' }}>
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
                                <TextField
                                    label="Navn på vaktlag"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                />
                                <Select label="Type" value={editForm.type} onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}>
                                    <option value="">Velg type</option>
                                    <option value="Døgnkontinuerlig (24/7)">Døgnkontinuerlig (24/7)</option>
                                    <option value="Midlertidlig">Midlertidlig</option>
                                </Select>
                                <TextField
                                    label="Telefonnummer"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                                />
                                <TextField
                                    label="Koststed"
                                    value={editForm.koststed}
                                    onChange={(e) => setEditForm((f) => ({ ...f, koststed: e.target.value }))}
                                />
                            </div>
                            <Textarea
                                label="Beskrivelse"
                                value={editForm.description}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                minRows={2}
                                resize="vertical"
                            />
                        </Box>

                        <HStack gap="space-16" style={{ marginBottom: '1.5rem' }}>
                            <Button variant="primary" onClick={handleUpdateGroup} loading={isUpdating} disabled={!editForm.name}>
                                Lagre endringer
                            </Button>
                            <Button
                                variant="tertiary"
                                onClick={() => {
                                    setActiveTab('list')
                                    setEditingGroup(null)
                                }}
                            >
                                Avbryt
                            </Button>
                        </HStack>

                        {renderMemberSection('edit')}
                    </Tabs.Panel>
                )}
            </Tabs>
        </div>
    )
}

export default VaktlagAdmin
