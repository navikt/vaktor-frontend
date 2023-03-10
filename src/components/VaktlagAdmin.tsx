import { Button, Table, Loader, Pagination, Alert, Select, ToggleGroup, TextField, Textarea, Label, HelpText, Search } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules, User, Vaktlag } from '../types/types'
import PerioderOptions from './PerioderOptions'
import VaktlagMembers from './VaktlagMembers'

const updateUsers = async (users: User[], setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
    var user_order = users.sort((a: User, b: User) => a.group_order_index! - b.group_order_index!).map((user: User) => user.id) // bare en liste med identer
    var url = `/vaktor/api/create_schedule/?group_id=${users[0].groups[0].id}&rolloverTime=${'text'}`
    var fetchOptions = {
        method: 'POST',
        body: JSON.stringify(user_order),
    }

    await fetch(url, fetchOptions)
        .then(async (r) => {
            if (!r.ok) {
                const rText = await r.json()
                setResponseError(rText.detail)
                return []
            }
            return r.json()
        })
        .then((data: Schedules) => {
            setResponse(data)
        })
        .catch((error: Error) => {
            console.error(error.name, error.message)
            throw error /* <-- rethrow the error so consumer can still catch it */
        })
}

const createVaktlag = async (
    name: string,
    type: string,
    phone: string,
    description: string,
    teamkatalog: string,

    setResponse: Dispatch<any>,
    setResponseError: Dispatch<string>
) => {
    var url = `/vaktor/api/create_new_vaktlag/?name=${name}&type=${type}&phone=${phone}&teamkatalog=${teamkatalog}&description=${description}`
    var fetchOptions = {
        method: 'POST',
    }

    await fetch(url, fetchOptions)
        .then(async (r) => {
            if (!r.ok) {
                const rText = await r.json()
                setResponseError(rText.detail)
                return []
            }
            return r.json()
        })
        .then((data: Schedules) => {
            setResponse(data)
        })
        .catch((error: Error) => {
            console.error(error.name, error.message)
            throw error /* <-- rethrow the error so consumer can still catch it */
        })
}

const VaktlagAdmin = () => {
    const { user } = useAuth()
    const [itemData, setItemData] = useState<User[]>([])
    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')
    const [loading, setLoading] = useState(false)

    const [page, setPage] = useState(1)

    const [selectedVaktlag, setSelctedVaktlag] = useState<Vaktlag | undefined>(user.groups[0])

    const mapMembers = (members: User[]) =>
        members
            .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
            .map((user, index) => {
                if (user.group_order_index === undefined) {
                    user.group_order_index = index + 1
                }
                user.id = user.id.toUpperCase()
                return <VaktlagMembers member={user} key={index} itemData={members} setItemData={setItemData}></VaktlagMembers>
            })

    const mapMembersMidlertidig = (members: User[]) =>
        members.map((user, index) => {
            if (user.group_order_index === undefined) {
                user.group_order_index = index + 1
            }
            user.id = user.id.toUpperCase()
            var options = {
                name: user.name,
                user_id: user.id,
            }
            return (
                <option key={index} value={JSON.stringify(options)}>
                    {user.name}
                </option>
            )
        })

    const mapForms = (forms: any) =>
        forms.map((form: any, index: any) => {
            // NB! be careful for Day time saving ( clock settings)
            return (
                <>
                    {form.name !== '' ? (
                        <Table.Row key={index}>
                            <Table.DataCell>{form.name}</Table.DataCell>
                            <Table.DataCell>{form.role}</Table.DataCell>
                        </Table.Row>
                    ) : (
                        <></>
                    )}
                </>
            )
        })

    //// #####   Flere forms-greier

    const [newVaktlag, setNewVaktlag] = useState([
        {
            name: '',
            type: '',
            description: '',
            teamkatalog: '',
            phone: '',
        },
    ])

    const [forms, setForms] = useState([
        {
            name: '',
            role: '',
            description: '',
            contactInfo: '',
        },
    ])

    const createNewVaktlag = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        newVaktlag.forEach((vaktlag) => {
            console.log(vaktlag)
            createVaktlag(vaktlag.name, vaktlag.type, vaktlag.phone, vaktlag.description, vaktlag.teamkatalog, setResponse, setResponseError)
        })
    }

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        forms.forEach((form) => {
            console.log()
            //createTempSchedule(form.user_id, form.group, form.type, form.role, setResponse, setResponseError)
        })
    }

    const handleAddForm = () => {
        setForms([
            ...forms,
            {
                name: '',
                role: '',
                description: '',
                contactInfo: '',
            },
        ])
    }

    //// #####

    useEffect(() => {
        //setLoading(true);
        if (selectedVaktlag === undefined) {
            return
        }
        fetch(`/vaktor/api/get_my_groupmembers?group_id=${selectedVaktlag.id}`)
            .then((membersRes) => membersRes.json())
            .then((groupMembersJson) => {
                setItemData(groupMembersJson.filter((user: User) => user.role !== 'leveranseleder'))
                setLoading(false)
            })
    }, [response, user, selectedVaktlag])

    if (loading === true) return <Loader></Loader>
    return (
        <>
            {response.length !== 0 || responseError !== '' ? (
                mapResponse(response, page, setPage, responseError)
            ) : (
                <div
                    style={{
                        marginTop: '2vh',
                        marginBottom: '3vh',
                        display: 'grid',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        gap: '20px',
                    }}
                >
                    <div style={{ width: '43%', margin: 'auto' }}></div>
                    <div
                        style={{
                            display: 'flex',
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {user.groups.length > 1 ? (
                            <ToggleGroup
                                defaultValue={user.groups[0].id}
                                onChange={(e) => setSelctedVaktlag(user.groups.find((group) => group.id === e))}
                            >
                                {user.groups.map((group: Vaktlag) => (
                                    <ToggleGroup.Item key={group.id} value={group.id}>
                                        {' '}
                                        {group.name}
                                    </ToggleGroup.Item>
                                ))}
                                <ToggleGroup.Item key="new" value="new">
                                    Nytt Vaktlag
                                </ToggleGroup.Item>
                            </ToggleGroup>
                        ) : (
                            <b>{user.groups[0].name}</b>
                        )}
                    </div>

                    {selectedVaktlag === undefined ? (
                        <>
                            <TextField
                                label="Navn på Vaktlag"
                                onChange={(e) => {
                                    const vaktlag = [...newVaktlag]
                                    vaktlag[0].name = String(e.target.value)
                                    setNewVaktlag(vaktlag)
                                }}
                            />
                            {/*  TODO: 👇👇 Should probably include link to Teamkatalogen at some point 👇👇  */}
                            {/* <TextField
                                label="Lenke til Teamkatalogen"
                                onChange={(e) => {
                                    const vaktlag = [...newVaktlag]
                                    vaktlag[0].teamkatalog = String(e.target.value)
                                    setNewVaktlag(vaktlag)
                                }}
                            /> */}
                            <TextField
                                label="Vakttelefonnummer"
                                onChange={(e) => {
                                    const vaktlag = [...newVaktlag]
                                    vaktlag[0].phone = String(e.target.value)
                                    setNewVaktlag(vaktlag)
                                }}
                            />
                            <Textarea
                                label="Beskrivelse av ansvarsområde"
                                onChange={(e) => {
                                    const vaktlag = [...newVaktlag]
                                    vaktlag[0].description = String(e.target.value)
                                    setNewVaktlag(vaktlag)
                                }}
                            />
                            <Select
                                label="Type"
                                onChange={(e) => {
                                    const vaktlag = [...newVaktlag]
                                    vaktlag[0].type = String(e.target.value)
                                    setNewVaktlag(vaktlag)
                                }}
                            >
                                <option disabled selected>
                                    Velg Type
                                </option>
                                <option value="247">Døgnkontinuerlig 24/7</option>
                                <option value="delvis" disabled>
                                    Delvis Dekning
                                </option>
                                <option value="midlertidig">Midlertidig</option>
                            </Select>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Label style={{ marginBottom: '-5px' }}>Leveranseleder</Label>
                                <HelpText title="Leveranseleder">Leveranseleder settes automatisk til å være deg som oppretter Vaktlaget</HelpText>
                            </div>
                            <TextField disabled label="Leveranseleder" hideLabel placeholder={user.name}></TextField>

                            <Button onClick={createNewVaktlag}>Opprett Vaktlag</Button>
                        </>
                    ) : (
                        <>
                            <Label>Navn</Label>
                            {selectedVaktlag.name}
                            <Label>Type</Label>
                            {selectedVaktlag.type}
                            <Label>Description</Label>
                            {selectedVaktlag.description}

                            <div style={{ margin: 'auto', gap: '20px', display: 'grid' }}>
                                <Table
                                    style={{
                                        minWidth: '650px',
                                        maxWidth: '60vw',
                                        backgroundColor: 'white',
                                        marginTop: '2vh',
                                        marginBottom: '3vh',
                                    }}
                                >
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                            <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                                            <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>{itemData ? mapMembers(itemData) : <Table.Row></Table.Row>}</Table.Body>
                                </Table>

                                {forms.map((form, index) => (
                                    <div key={index}>
                                        <div style={{ margin: 'auto', gap: '15px', display: 'flex' }}>
                                            <div style={{ maxWidth: '300px' }}>
                                                <Search
                                                    label="Søk etter vakthaver"
                                                    hideLabel={false}
                                                    variant="secondary"
                                                    onChange={(e) => {
                                                        const newForms = [...forms]
                                                        const selectJson = JSON.parse(e)
                                                        newForms[index].name = selectJson.name
                                                        newForms[index].role = selectJson.user_id
                                                        setForms(newForms)
                                                        console.log('Selected object: ', selectJson)
                                                    }}
                                                ></Search>
                                            </div>
                                            <Select
                                                label="Rolle"
                                                onChange={(e) => {
                                                    const newForms = [...forms]
                                                    newForms[index].role = String(e.target.value)
                                                    setForms(newForms)
                                                }}
                                            >
                                                <option disabled selected>
                                                    Velg Rolle
                                                </option>
                                                <option value="leveranseleder">Leveranseleder</option>
                                                <option value="vaktsjef">Vaktsjef</option>
                                                <option value="vakthaver">Vakthaver</option>
                                            </Select>
                                            {index + 1 === forms.length ? (
                                                <div style={{ marginTop: '10px', alignSelf: 'end' }}>
                                                    <>
                                                        <Button onClick={handleAddForm} style={{}}>
                                                            Legg til person
                                                        </Button>{' '}
                                                    </>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>

                                        <br />
                                    </div>
                                ))}
                            </div>
                            {/* <Button onClick={handleSubmit}>Oppdater Medlemmer</Button> */}
                        </>
                    )}

                    <></>
                </div>
            )}
        </>
    )
}

export default VaktlagAdmin

const mapResponse = (schedules: Schedules[], page: number, setPage: Dispatch<number>, error: string) => {
    const rowsPerPage = 10
    let sortData = schedules
    sortData = sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    if (error !== '') {
        return (
            <div style={{ height: '60vh' }}>
                <Alert
                    style={{
                        maxWidth: '50%',
                        minWidth: '550px',
                        margin: 'auto',
                    }}
                    variant="error"
                >
                    Woopsie, det har skjedd en feil. <br />
                    <i>{error}</i>
                </Alert>
            </div>
        )
    }
    return (
        <div
            className="grid gap-4"
            style={{
                maxWidth: '650px',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
            }}
        >
            <Alert variant="success">Et vaktlagt ble opprettet:</Alert>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Uke</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortData.map((schedule: Schedules, idx: number) => (
                        <Table.Row key={idx}>
                            <Table.HeaderCell
                                scope="row"
                                style={{
                                    minWidth: '210px',
                                    maxWidth: '210px',
                                }}
                            >
                                {schedule.user.name}
                            </Table.HeaderCell>

                            <Table.DataCell>
                                Uke: {moment(schedule.start_timestamp * 1000).week()}{' '}
                                {moment(schedule.start_timestamp * 1000).week() < moment(schedule.end_timestamp * 1000).week()
                                    ? ' - ' + moment(schedule.end_timestamp * 1000).week()
                                    : ''}
                                <br />
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            <Pagination page={page} onPageChange={setPage} count={Math.ceil(schedules.length / rowsPerPage)} style={{ marginLeft: '0' }} />
        </div>
    )
}
