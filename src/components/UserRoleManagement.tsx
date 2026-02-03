import React, { useState, useEffect, useRef } from 'react'
import {
    Table,
    Button,
    Modal,
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
    Popover,
} from '@navikt/ds-react'
import { PlusIcon, TrashIcon, PersonIcon, PersonGroupIcon } from '@navikt/aksel-icons'
import { User, Vaktlag, Roles, GroupRole } from '../types/types'

interface UserWithGroupRoles extends User {
    group_roles: GroupRole[]
}

interface RoleAssignment {
    user_id: string
    user_name: string
    role: string
}

const UserRoleManagement: React.FC = () => {
    const [users, setUsers] = useState<UserWithGroupRoles[]>([])
    const [groups, setGroups] = useState<Vaktlag[]>([])
    const [allRoles, setAllRoles] = useState<Roles[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchFilter, setSearchFilter] = useState('')
    const [selectedGroup, setSelectedGroup] = useState<string>('')
    const [activeTab, setActiveTab] = useState('users')

    // Modal states
    const [assignRoleModalOpen, setAssignRoleModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserWithGroupRoles | null>(null)
    const [selectedGroupForRole, setSelectedGroupForRole] = useState<string>('')
    const [selectedRoleTitle, setSelectedRoleTitle] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Delete confirmation
    const [deletePopover, setDeletePopover] = useState<{
        userId: string
        groupId: string
        roleTitle: string
    } | null>(null)
    const deleteButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

    const groupScopedRoles = ['vakthaver', 'vaktsjef', 'leveranseleder']
    const globalRoles = ['admin', 'okonomi', 'bdm', 'personalleder']

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [usersRes, groupsRes, rolesRes] = await Promise.all([fetch('/api/users'), fetch('/api/groups'), fetch('/api/roles')])

            if (!usersRes.ok) throw new Error('Kunne ikke hente brukere')
            if (!groupsRes.ok) throw new Error('Kunne ikke hente grupper')

            const usersData = await usersRes.json()
            const groupsData = await groupsRes.json()
            const rolesData = rolesRes.ok ? await rolesRes.json() : []

            setUsers(usersData)
            setGroups(groupsData)
            setAllRoles(rolesData)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedGroupForRole || !selectedRoleTitle) return

        setIsSubmitting(true)
        setError(null)
        try {
            const res = await fetch(`/api/groups/${selectedGroupForRole}/roles?user_id=${selectedUser.id}&role_title=${selectedRoleTitle}`, {
                method: 'POST',
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.detail || 'Kunne ikke tildele rolle')
            }

            setSuccess(`Rolle '${selectedRoleTitle}' tildelt til ${selectedUser.name}`)
            setAssignRoleModalOpen(false)
            setSelectedUser(null)
            setSelectedGroupForRole('')
            setSelectedRoleTitle('')
            fetchData()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemoveRole = async (userId: string, groupId: string, roleTitle: string) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const res = await fetch(`/api/groups/${groupId}/roles?user_id=${userId}&role_title=${roleTitle}`, {
                method: 'DELETE',
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.detail || 'Kunne ikke fjerne rolle')
            }

            setSuccess(`Rolle '${roleTitle}' fjernet`)
            setDeletePopover(null)
            fetchData()
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredUsers = users.filter((user) => {
        const nameMatch = user.name.toLowerCase().includes(searchFilter.toLowerCase())
        const idMatch = user.id.toLowerCase().includes(searchFilter.toLowerCase())
        return nameMatch || idMatch
    })

    const getRoleTagVariant = (roleTitle: string): 'info' | 'success' | 'warning' | 'error' | 'neutral' => {
        switch (roleTitle) {
            case 'admin':
                return 'error'
            case 'leveranseleder':
                return 'warning'
            case 'vaktsjef':
                return 'success'
            case 'vakthaver':
                return 'info'
            case 'okonomi':
            case 'bdm':
            case 'personalleder':
                return 'neutral'
            default:
                return 'neutral'
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Loader size="xlarge" title="Laster..." />
            </div>
        )
    }

    return (
        <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
            {error && (
                <Alert variant="error" style={{ marginBottom: '1rem' }}>
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
                    <Tabs.Tab value="users" label="Brukere" icon={<PersonIcon />} />
                    <Tabs.Tab value="groups" label="Vaktlag" icon={<PersonGroupIcon />} />
                </Tabs.List>

                <Tabs.Panel value="users" style={{ paddingTop: '1rem' }}>
                    <HStack gap="4" style={{ marginBottom: '1rem' }}>
                        <Search
                            label="Sok etter bruker"
                            hideLabel
                            variant="simple"
                            placeholder="Sok etter navn eller NAVident..."
                            value={searchFilter}
                            onChange={(value) => setSearchFilter(value)}
                            style={{ width: '300px' }}
                        />
                    </HStack>

                    <Table zebraStripes>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>NAVident</Table.HeaderCell>
                                <Table.HeaderCell>Navn</Table.HeaderCell>
                                <Table.HeaderCell>Globale roller</Table.HeaderCell>
                                <Table.HeaderCell>Vaktlag-roller</Table.HeaderCell>
                                <Table.HeaderCell>Handlinger</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredUsers.map((user) => (
                                <Table.Row key={user.id}>
                                    <Table.DataCell>{user.id}</Table.DataCell>
                                    <Table.DataCell>{user.name}</Table.DataCell>
                                    <Table.DataCell>
                                        <HStack gap="1" wrap>
                                            {user.roles
                                                ?.filter((role) => globalRoles.includes(role.title))
                                                .map((role) => (
                                                    <Tag key={role.id} variant={getRoleTagVariant(role.title)} size="small">
                                                        {role.title}
                                                    </Tag>
                                                ))}
                                            {(!user.roles || user.roles.filter((r) => globalRoles.includes(r.title)).length === 0) && (
                                                <BodyShort size="small">Ingen</BodyShort>
                                            )}
                                        </HStack>
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <VStack gap="1">
                                            {user.group_roles?.map((gr, idx) => (
                                                <HStack key={idx} gap="1" align="center">
                                                    <Tag variant={getRoleTagVariant(gr.role.title)} size="small">
                                                        {gr.role.title}
                                                    </Tag>
                                                    <BodyShort size="small">i {gr.group_name}</BodyShort>
                                                    <Button
                                                        variant="tertiary-neutral"
                                                        size="xsmall"
                                                        icon={<TrashIcon />}
                                                        ref={(el) => {
                                                            deleteButtonRefs.current[`${user.id}-${gr.group_id}-${gr.role.title}`] = el
                                                        }}
                                                        onClick={() =>
                                                            setDeletePopover({
                                                                userId: user.id,
                                                                groupId: gr.group_id,
                                                                roleTitle: gr.role.title,
                                                            })
                                                        }
                                                    />
                                                    <Popover
                                                        open={
                                                            deletePopover?.userId === user.id &&
                                                            deletePopover?.groupId === gr.group_id &&
                                                            deletePopover?.roleTitle === gr.role.title
                                                        }
                                                        onClose={() => setDeletePopover(null)}
                                                        anchorEl={deleteButtonRefs.current[`${user.id}-${gr.group_id}-${gr.role.title}`]}
                                                    >
                                                        <Popover.Content>
                                                            <VStack gap="2">
                                                                <BodyShort>
                                                                    Fjern {gr.role.title} fra {user.name}?
                                                                </BodyShort>
                                                                <HStack gap="2">
                                                                    <Button
                                                                        variant="danger"
                                                                        size="small"
                                                                        loading={isSubmitting}
                                                                        onClick={() => handleRemoveRole(user.id, gr.group_id, gr.role.title)}
                                                                    >
                                                                        Fjern
                                                                    </Button>
                                                                    <Button variant="tertiary" size="small" onClick={() => setDeletePopover(null)}>
                                                                        Avbryt
                                                                    </Button>
                                                                </HStack>
                                                            </VStack>
                                                        </Popover.Content>
                                                    </Popover>
                                                </HStack>
                                            ))}
                                            {(!user.group_roles || user.group_roles.length === 0) && (
                                                <BodyShort size="small">Ingen vaktlag-roller</BodyShort>
                                            )}
                                        </VStack>
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Button
                                            variant="tertiary"
                                            size="small"
                                            icon={<PlusIcon />}
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setAssignRoleModalOpen(true)
                                            }}
                                        >
                                            Tildel rolle
                                        </Button>
                                    </Table.DataCell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </Tabs.Panel>

                <Tabs.Panel value="groups" style={{ paddingTop: '1rem' }}>
                    <HStack gap="4" style={{ marginBottom: '1rem' }}>
                        <Select
                            label="Velg vaktlag"
                            hideLabel
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            style={{ width: '300px' }}
                        >
                            <option value="">Velg vaktlag...</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </Select>
                    </HStack>

                    {selectedGroup && <GroupRolesView groupId={selectedGroup} groups={groups} onRefresh={fetchData} />}

                    {!selectedGroup && (
                        <Box padding="6" background="surface-subtle" borderRadius="medium">
                            <BodyShort>Velg et vaktlag for å se roller</BodyShort>
                        </Box>
                    )}
                </Tabs.Panel>
            </Tabs>

            {/* Assign Role Modal */}
            <Modal
                open={assignRoleModalOpen}
                onClose={() => {
                    setAssignRoleModalOpen(false)
                    setSelectedUser(null)
                    setSelectedGroupForRole('')
                    setSelectedRoleTitle('')
                }}
                aria-label="Tildel rolle"
            >
                <Modal.Header>
                    <Heading size="medium">Tildel vaktlag-rolle</Heading>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <VStack gap="4">
                            <Box>
                                <Label>Bruker</Label>
                                <BodyShort>
                                    {selectedUser.name} ({selectedUser.id})
                                </BodyShort>
                            </Box>
                            <Select label="Velg vaktlag" value={selectedGroupForRole} onChange={(e) => setSelectedGroupForRole(e.target.value)}>
                                <option value="">Velg vaktlag...</option>
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </Select>
                            <Select label="Velg rolle" value={selectedRoleTitle} onChange={(e) => setSelectedRoleTitle(e.target.value)}>
                                <option value="">Velg rolle...</option>
                                {groupScopedRoles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </Select>
                        </VStack>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleAssignRole} loading={isSubmitting} disabled={!selectedGroupForRole || !selectedRoleTitle}>
                        Tildel rolle
                    </Button>
                    <Button
                        variant="tertiary"
                        onClick={() => {
                            setAssignRoleModalOpen(false)
                            setSelectedUser(null)
                        }}
                    >
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

// Sub-component for viewing roles in a specific group
const GroupRolesView: React.FC<{
    groupId: string
    groups: Vaktlag[]
    onRefresh: () => void
}> = ({ groupId, groups, onRefresh }) => {
    const [roles, setRoles] = useState<RoleAssignment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const group = groups.find((g) => g.id === groupId)

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/groups/${groupId}/roles`)
                if (!res.ok) throw new Error('Kunne ikke hente roller')
                const data = await res.json()
                setRoles(data)
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setLoading(false)
            }
        }
        fetchRoles()
    }, [groupId])

    if (loading) return <Loader size="medium" />
    if (error) return <Alert variant="error">{error}</Alert>

    const roleGroups = {
        leveranseleder: roles.filter((r) => r.role === 'leveranseleder'),
        vaktsjef: roles.filter((r) => r.role === 'vaktsjef'),
        vakthaver: roles.filter((r) => r.role === 'vakthaver'),
    }

    return (
        <VStack gap="4">
            <Heading size="small">{group?.name}</Heading>

            {Object.entries(roleGroups).map(([roleTitle, members]) => (
                <Box key={roleTitle} padding="4" background="surface-subtle" borderRadius="medium">
                    <HStack gap="2" align="center" style={{ marginBottom: '0.5rem' }}>
                        <Tag variant={roleTitle === 'leveranseleder' ? 'warning' : roleTitle === 'vaktsjef' ? 'success' : 'info'}>{roleTitle}</Tag>
                        <BodyShort size="small">({members.length} medlemmer)</BodyShort>
                    </HStack>
                    {members.length > 0 ? (
                        <VStack gap="1">
                            {members.map((m) => (
                                <BodyShort key={m.user_id}>
                                    {m.user_name} ({m.user_id})
                                </BodyShort>
                            ))}
                        </VStack>
                    ) : (
                        <BodyShort size="small">Ingen med denne rollen</BodyShort>
                    )}
                </Box>
            ))}
        </VStack>
    )
}

export default UserRoleManagement
