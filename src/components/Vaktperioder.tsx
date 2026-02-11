import {
    Button,
    Table,
    DatePicker,
    useDatepicker,
    HelpText,
    Pagination,
    Alert,
    Select,
    ToggleGroup,
    Modal,
    BodyLong,
    Heading,
    Tabs,
} from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Schedules, User, Vaktlag } from '../types/types'
import { hasRoleInGroup } from '../utils/roles'
import DatePickeroo from './MidlertidigeVaktperioder'
import PerioderOptions from './PerioderOptions'
import SchedulePreview from './SchedulePreview'
import BulkDeleteSchedules from './BulkDeleteSchedules'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext } from '@dnd-kit/sortable'

const createSchedule = async (
    users: User[],
    group: string,
    setResponse: Dispatch<any>,
    start_timestamp: number,
    end_timestamp: number,
    midlertidlig_vakt: boolean,
    rolloverDay: number,
    setResponseError: Dispatch<string>,
    rolloverTime: number
) => {
    var user_order = users.sort((a: User, b: User) => a.group_order_index! - b.group_order_index!).map((user: User) => user.id) // bare en liste med identer
    var url = `/api/create_schedule/?group_id=${group}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&midlertidlig_vakt=${midlertidlig_vakt}&rolloverDay=${rolloverDay}&rolloverTime=${rolloverTime}`
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

const createTempSchedule = async (
    user_id: string,
    group_id: string,
    start_timestamp: number,
    end_timestamp: number,
    setResponse: Dispatch<any>,
    setResponseError: Dispatch<string>
) => {
    var url = `/api/create_temp_schedule/?user_id=${user_id}&group_id=${group_id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&`
    console.log('createTempSchedule: ', user_id, start_timestamp, end_timestamp)
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
                <Button style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
                    Last inn siden på nytt
                </Button>
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
            <Alert variant="success">Disse vaktene ble opprettet:</Alert>
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
            <Button style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
                Last inn siden på nytt
            </Button>
        </div>
    )
}

const Vaktperioder = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [itemData, setItemData] = useState<User[]>([])
    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')
    const [loading, setLoading] = useState(false)
    const [isMidlertidlig, setIsMidlertidlig] = useState(true)
    const [rolloverDay, setRolloverDay] = useState<number>(2)
    const [rolloverTime, setRolloverTime] = useState<number>(12)
    const [endTimestamp, setEndTimestamp] = useState<number>(0)
    const [page, setPage] = useState(1)

    const [open, setOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('opprett')

    const [selectedVaktlag, setSelctedVaktlag] = useState(user.groups[0].id)
    const [lastVakt, setLastVakt] = useState<Schedules | undefined>()
    const [startTimestamp, setStartTimestamp] = useState<number>(0)

    const { datepickerProps, inputProps, selectedDay } = useDatepicker({
        fromDate: new Date('Jan 01 2023'),
        toDate: new Date('Dec 31 2027'),
        defaultSelected: new Date('Jan 01 2023'),
    })

    const {
        datepickerProps: endDatepickerProps,
        inputProps: endInputProps,
        selectedDay: selectedEndDay,
        setSelected: setSelectedEnd,
    } = useDatepicker({
        fromDate: new Date('Jan 01 2023'),
        toDate: new Date('Dec 31 2027'),
        defaultSelected: new Date('Jan 01 2023'),
    })

    const {
        datepickerProps: startDatepickerProps,
        inputProps: startInputProps,
        selectedDay: selectedStartDay,
        setSelected: setSelectedStart,
    } = useDatepicker({
        fromDate: new Date('Jan 01 2023'),
        toDate: new Date('Dec 31 2027'),
        defaultSelected: new Date('Jan 01 2023'),
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
                            <Table.DataCell>
                                {form.fromDate !== '' ? (
                                    <>
                                        {moment.unix(form.fromDate).format('L')} kl. {moment.unix(form.fromTime - 3600).format('HH:mm')}
                                    </>
                                ) : (
                                    <></>
                                )}{' '}
                            </Table.DataCell>
                            <Table.DataCell>
                                {form.fromDate !== '' ? (
                                    <>
                                        {moment.unix(form.toDate).format('L')} kl. {moment.unix(form.toTime - 3600).format('HH:mm')}
                                    </>
                                ) : (
                                    <></>
                                )}
                            </Table.DataCell>
                        </Table.Row>
                    ) : (
                        <></>
                    )}
                </>
            )
        })

    //// #####   Flere forms-greier

    const [forms, setForms] = useState([
        {
            name: '',
            user_id: '',
            group: '',
            fromDate: 0,
            fromTime: 0,
            toDate: 0,
            toTime: 0,
        },
    ])

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        forms.forEach((form) => {
            if (form.user_id !== '' && form.fromDate !== 0 && form.toDate !== 0) {
                console.log('Opprettet vakt: ', form.user_id)
                createTempSchedule(form.user_id, form.group, form.fromDate + form.fromTime, form.toDate + form.toTime, setResponse, setResponseError)
            } else {
                console.log('Dette burde jo ikke skje da: ', form.name)
            }
        })
        {
            setOpen(true)
        }
    }

    const handleAddForm = () => {
        setForms([
            ...forms,
            {
                name: '',
                user_id: '',
                group: '',
                fromDate: 0,
                fromTime: 0,
                toDate: 0,
                toTime: 0,
            },
        ])
    }

    const handleChildProps = (index: any, dateProps: any) => {
        let newForms = [...forms]
        newForms[index].fromDate = dateProps.from
        newForms[index].toDate = dateProps.to
        setForms(newForms)
    }

    //// #####

    useEffect(() => {
        if (selectedEndDay) {
            setEndTimestamp(selectedEndDay.getTime() / 1000)
        }
    }, [selectedEndDay])

    useEffect(() => {
        if (selectedStartDay && !lastVakt) {
            setStartTimestamp(selectedStartDay.getTime() / 1000)
        }
    }, [selectedStartDay, lastVakt])

    useEffect(() => {
        if (lastVakt) {
            setStartTimestamp(lastVakt.end_timestamp)
            setSelectedStart(new Date(lastVakt.end_timestamp * 1000))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastVakt])

    useEffect(() => {
        if (startTimestamp > 0) {
            // Set end date to 4 weeks (28 days) after start date
            const endDate = new Date((startTimestamp + 28 * 24 * 60 * 60) * 1000)
            setSelectedEnd(endDate)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startTimestamp])

    useEffect(() => {
        Promise.all([fetch(`/api/get_my_groupmembers?group_id=${selectedVaktlag}`), fetch(`/api/last_schedule?group_id=${selectedVaktlag}`)])
            .then(async ([membersRes, scheduleRes]) => {
                const membersjson = await membersRes.json().catch((error) => {
                    console.error(`Error parsing JSON from 'membersRes': ${error.message}`)
                    return null
                })

                const schedulejson = await scheduleRes.json().catch((error) => {
                    console.error(`Error parsing JSON from 'scheduleRes': ${error.message}`)
                    return null
                })

                return [membersjson, schedulejson]
            })
            .then(([groupMembersJson, lastVaktJson]) => {
                if (!groupMembersJson || !lastVaktJson) {
                    console.error('Error fetching data')
                    // Sort itemData here to avoid duplicate index warnings
                    setItemData(
                        groupMembersJson
                            .filter((user: User) => user.role !== 'leveranseleder')
                            .filter((user: User) => hasRoleInGroup(user, selectedVaktlag, ['vakthaver', 'vaktsjef']))
                            .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
                    )
                    setIsMidlertidlig(user.groups.filter((group) => group.id == selectedVaktlag)[0].type === 'Midlertidlig')
                    setLastVakt(undefined)
                    setLoading(false)
                    //return
                } else {
                    // Sort itemData here to avoid duplicate index warnings
                    setItemData(
                        groupMembersJson
                            .filter((user: User) => user.role !== 'leveranseleder')
                            .filter((user: User) => hasRoleInGroup(user, selectedVaktlag, ['vakthaver', 'vaktsjef']))
                            .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
                    )
                    setIsMidlertidlig(user.groups.filter((group) => group.id == selectedVaktlag)[0].type === 'Midlertidlig')
                    setLastVakt(lastVaktJson)
                    setLoading(false)
                }
            })
            .catch((error) => {
                console.error(`Error fetching data: ${error.message}`)
            })
    }, [user, selectedVaktlag])

    // DND-kit sensors and handlers
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    // IDs for DnD: use ressursnummer for uniqueness
    const activeIds = itemData
        .filter((user: User) => user.group_order_index !== 100)
        .filter((user: User) => !user.roles.some((role) => role.id === '0d20adfe-2eae-446a-ae1c-3502d7ff33c4'))
        .sort((a, b) => a.group_order_index! - b.group_order_index!)
        .map((user) => user.ressursnummer)

    const handleDragEnd = (event: any) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeIndex = activeIds.indexOf(active.id)
        const overIndex = activeIds.indexOf(over.id)

        if (activeIndex !== -1 && overIndex !== -1) {
            // Reorder the ressursnummer array
            const newActiveIds = arrayMove(activeIds, activeIndex, overIndex)

            // Update itemData with new group_order_index values
            const updated = itemData.map((user) => {
                const newIndex = newActiveIds.indexOf(user.ressursnummer)
                if (newIndex !== -1) {
                    return { ...user, group_order_index: newIndex + 1 }
                }
                return user
            })

            setItemData(updated)
        }
    }

    return (
        <>
            {response.length !== 0 || responseError !== '' ? (
                isMidlertidlig ? (
                    <>
                        <Modal
                            open={open}
                            aria-label="Modal for midlertidige vakter"
                            onClose={() => {
                                setOpen((x) => !x)
                                setResponse([])
                                setForms([])
                                setResponseError('')
                                window.location.reload()
                            }}
                        >
                            <Modal.Body>
                                <Heading spacing level="2" size="medium">
                                    Disse vaktene ble opprettet:
                                </Heading>
                                <BodyLong spacing>{mapForms(forms)}</BodyLong>
                            </Modal.Body>
                        </Modal>
                    </>
                ) : (
                    mapResponse(response, page, setPage, responseError)
                )
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
                            <ToggleGroup defaultValue={user.groups[0].id} onChange={(e) => setSelctedVaktlag(e)}>
                                {user.groups.map((group: Vaktlag) => (
                                    <ToggleGroup.Item key={group.id} value={group.id}>
                                        {' '}
                                        {group.name}
                                    </ToggleGroup.Item>
                                ))}
                            </ToggleGroup>
                        ) : (
                            <b>{user.groups[0].name}</b>
                        )}
                    </div>

                    <Tabs value={activeTab} onChange={setActiveTab} style={{ marginTop: '2vh' }}>
                        <Tabs.List>
                            <Tabs.Tab value="opprett" label="Opprett vakter" />
                            <Tabs.Tab value="administrer" label="Administrer vakter" />
                        </Tabs.List>

                        <Tabs.Panel value="opprett" style={{ marginTop: '2vh' }}>
                            {isMidlertidlig ? (
                                <>
                                    <div style={{ margin: 'auto', gap: '100px' }}>
                                        {forms.map((form, index) => (
                                            <div key={index}>
                                                <Select
                                                    label="vakthaver"
                                                    onChange={(e) => {
                                                        const newForms = [...forms]
                                                        const selectJson = JSON.parse(e.target.value)
                                                        newForms[index].name = selectJson.name
                                                        newForms[index].user_id = selectJson.user_id
                                                        // TODO må endres dersom man kan være vaktsjef for flere vaktlag...
                                                        newForms[index].group = selectedVaktlag
                                                        setForms(newForms)
                                                    }}
                                                >
                                                    <option disabled selected>
                                                        Velg Vakthaver
                                                    </option>
                                                    {mapMembersMidlertidig(itemData)}
                                                </Select>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        marginTop: '5px',
                                                    }}
                                                >
                                                    <div>
                                                        <DatePickeroo key={index} index={index} handleChildProps={handleChildProps} />
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'grid',
                                                            marginLeft: '10px',
                                                        }}
                                                    >
                                                        <Select
                                                            label="Klokken"
                                                            defaultValue={0}
                                                            onChange={(e) => {
                                                                const newForms = [...forms]
                                                                newForms[index].fromTime = Number(e.target.value) * 3600
                                                                setForms(newForms)
                                                            }}
                                                        >
                                                            <option value={0}>00:00</option>
                                                            <option value={1}>01:00</option>
                                                            <option value={2}>02:00</option>
                                                            <option value={3}>03:00</option>
                                                            <option value={4}>04:00</option>
                                                            <option value={5}>05:00</option>
                                                            <option value={6}>06:00</option>
                                                            <option value={7}>07:00</option>
                                                            <option value={8}>08:00</option>
                                                            <option value={9}>09:00</option>
                                                            <option value={10}>10:00</option>
                                                            <option value={11}>11:00</option>
                                                            <option value={12}>12:00</option>
                                                            <option value={13}>13:00</option>
                                                            <option value={14}>14:00</option>
                                                            <option value={15}>15:00</option>
                                                            <option value={16}>16:00</option>
                                                            <option value={17}>17:00</option>
                                                            <option value={18}>18:00</option>
                                                            <option value={19}>19:00</option>
                                                            <option value={20}>20:00</option>
                                                            <option value={21}>21:00</option>
                                                            <option value={22}>22:00</option>
                                                            <option value={23}>23:00</option>
                                                        </Select>
                                                        <Select
                                                            label="Klokken"
                                                            defaultValue={0}
                                                            onChange={(e) => {
                                                                const newForms = [...forms]
                                                                newForms[index].toTime = Number(e.target.value) * 3600
                                                                setForms(newForms)
                                                            }}
                                                        >
                                                            <option value={0}>00:00</option>
                                                            <option value={1}>01:00</option>
                                                            <option value={2}>02:00</option>
                                                            <option value={3}>03:00</option>
                                                            <option value={4}>04:00</option>
                                                            <option value={5}>05:00</option>
                                                            <option value={6}>06:00</option>
                                                            <option value={7}>07:00</option>
                                                            <option value={8}>08:00</option>
                                                            <option value={9}>09:00</option>
                                                            <option value={10}>10:00</option>
                                                            <option value={11}>11:00</option>
                                                            <option value={12}>12:00</option>
                                                            <option value={13}>13:00</option>
                                                            <option value={14}>14:00</option>
                                                            <option value={15}>15:00</option>
                                                            <option value={16}>16:00</option>
                                                            <option value={17}>17:00</option>
                                                            <option value={18}>18:00</option>
                                                            <option value={19}>19:00</option>
                                                            <option value={20}>20:00</option>
                                                            <option value={21}>21:00</option>
                                                            <option value={22}>22:00</option>
                                                            <option value={23}>23:00</option>
                                                        </Select>
                                                    </div>
                                                </div>
                                                {index + 1 === forms.length ? (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <Button onClick={handleAddForm}>Legg til Vakt</Button>{' '}
                                                    </div>
                                                ) : (
                                                    <></>
                                                )}
                                                <br />
                                                <hr />
                                            </div>
                                        ))}
                                    </div>
                                    ) : (
                                    <>
                                        {lastVakt ? (
                                            <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
                                                <div>
                                                    <h3>
                                                        Utvid vaktperiode fra siste vakt:{' '}
                                                        {moment(lastVakt.end_timestamp * 1000).format('DD.MM.YYYY HH:mm')}
                                                    </h3>
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '40px',
                                                        marginTop: '15px',
                                                    }}
                                                >
                                                    <DatePicker {...startDatepickerProps}>
                                                        <DatePicker.Input {...startInputProps} label="Fra" disabled />
                                                    </DatePicker>
                                                    <Select
                                                        label="Angi dag for vaktbytte:"
                                                        onChange={(e) => setRolloverDay(Number(e.target.value))}
                                                        defaultValue="2"
                                                    >
                                                        <option value="0">Mandag</option>
                                                        <option value="2">Onsdag</option>
                                                    </Select>
                                                    <Select
                                                        label="Angi tid for vaktbytte:"
                                                        onChange={(e) => setRolloverTime(Number(e.target.value))}
                                                        defaultValue="12"
                                                    >
                                                        <option value="0">00:00</option>
                                                        <option value="7">07:00</option>
                                                        <option value="8">08:00</option>
                                                        <option value="12">12:00</option>
                                                    </Select>
                                                    <DatePicker {...endDatepickerProps}>
                                                        <DatePicker.Input {...endInputProps} label="Til" />
                                                    </DatePicker>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
                                                <div>
                                                    <h3>Ingen eksisterende vakter funnet, opprett ny vaktperiode</h3>
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '40px',
                                                        marginTop: '15px',
                                                    }}
                                                >
                                                    {' '}
                                                    <DatePicker {...startDatepickerProps}>
                                                        <DatePicker.Input {...startInputProps} label="Fra" />
                                                    </DatePicker>
                                                    <Select
                                                        label="Angi dag for vaktbytte:"
                                                        onChange={(e) => setRolloverDay(Number(e.target.value))}
                                                        defaultValue="2"
                                                    >
                                                        <option value="0">Mandag</option>
                                                        <option value="2">Onsdag</option>
                                                    </Select>
                                                    <Select
                                                        label="Angi tid for vaktbytte:"
                                                        onChange={(e) => setRolloverTime(Number(e.target.value))}
                                                        defaultValue="12"
                                                    >
                                                        <option value="0">00:00</option>
                                                        <option value="7">07:00</option>
                                                        <option value="8">08:00</option>
                                                        <option value="12">12:00</option>
                                                    </Select>
                                                    <DatePicker {...endDatepickerProps}>
                                                        <DatePicker.Input {...endInputProps} label="Til" />
                                                    </DatePicker>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                    <Table>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                                <Table.HeaderCell scope="col">Fra</Table.HeaderCell>
                                                <Table.HeaderCell scope="col">Til</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>{forms ? mapForms(forms) : <Table.Row></Table.Row>}</Table.Body>
                                    </Table>
                                    <Button onClick={handleSubmit}>Opprett vakter</Button>
                                </>
                            ) : (
                                <>
                                    {lastVakt && lastVakt.end_timestamp ? (
                                        <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
                                            <div>
                                                <h3>Generer nye vaktperioder fra {moment.unix(lastVakt.end_timestamp).format('DD.MM.YYYY HH:mm')}</h3>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '40px',
                                                    marginTop: '15px',
                                                }}
                                            >
                                                <DatePicker {...startDatepickerProps}>
                                                    <DatePicker.Input {...startInputProps} label="Fra" disabled />
                                                </DatePicker>
                                                <Select
                                                    label="Angi dag for vaktbytte:"
                                                    onChange={(e) => setRolloverDay(Number(e.target.value))}
                                                    defaultValue="2"
                                                >
                                                    <option value="0">Mandag</option>
                                                    <option value="2">Onsdag</option>
                                                </Select>
                                                <Select
                                                    label="Angi tid for vaktbytte:"
                                                    onChange={(e) => setRolloverTime(Number(e.target.value))}
                                                    defaultValue="12"
                                                >
                                                    <option value="0">00:00</option>
                                                    <option value="7">07:00</option>
                                                    <option value="8">08:00</option>
                                                    <option value="12">12:00</option>
                                                </Select>
                                                <DatePicker {...endDatepickerProps}>
                                                    <DatePicker.Input {...endInputProps} label="Til" />
                                                </DatePicker>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', justifyContent: 'center', alignItems: 'center' }}>
                                            <div>
                                                <h3>Ingen eksisterende vakter funnet, opprett ny vaktperiode</h3>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '40px',
                                                    marginTop: '15px',
                                                }}
                                            >
                                                <DatePicker {...startDatepickerProps}>
                                                    <DatePicker.Input {...startInputProps} label="Fra" />
                                                </DatePicker>
                                                <Select
                                                    label="Angi dag for vaktbytte:"
                                                    onChange={(e) => setRolloverDay(Number(e.target.value))}
                                                    defaultValue="2"
                                                >
                                                    <option value="0">Mandag</option>
                                                    <option value="2">Onsdag</option>
                                                </Select>
                                                <Select
                                                    label="Angi tid for vaktbytte:"
                                                    onChange={(e) => setRolloverTime(Number(e.target.value))}
                                                    defaultValue="12"
                                                >
                                                    <option value="0">00:00</option>
                                                    <option value="7">07:00</option>
                                                    <option value="8">08:00</option>
                                                    <option value="12">12:00</option>
                                                </Select>
                                                <DatePicker {...endDatepickerProps}>
                                                    <DatePicker.Input {...endInputProps} label="Til" />
                                                </DatePicker>
                                            </div>
                                        </div>
                                    )}
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <Table
                                            style={{
                                                minWidth: '650px',
                                                maxWidth: '60vw',
                                                backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
                                                marginTop: '2vh',
                                                marginBottom: '3vh',
                                            }}
                                        >
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell scope="col">
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'space-around',
                                                            }}
                                                        >
                                                            ID
                                                            <HelpText
                                                                title="Hva brukes ID til?"
                                                                style={{
                                                                    marginLeft: '10px',
                                                                }}
                                                            >
                                                                <b>Id:</b> Brukes for å bestemme hvilken rekkefølge vakthaverne skal gå vakt. Den som
                                                                står øverst vil få første vakt når nye perioder genereres.
                                                                <br />
                                                                <br />
                                                                <b>Tips:</b> Du kan endre rekkefølgen ved å dra og slippe radene i tabellen.
                                                            </HelpText>
                                                        </div>
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'space-around',
                                                            }}
                                                        >
                                                            {/* Fjern header */}
                                                            Fjern
                                                        </div>
                                                    </Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                <SortableContext items={activeIds}>
                                                    {itemData
                                                        .filter((user: User) => user.group_order_index !== 100)
                                                        .filter(
                                                            (user: User) =>
                                                                !user.roles.some((role) => role.id === '0d20adfe-2eae-446a-ae1c-3502d7ff33c4')
                                                        )
                                                        .sort((a, b) => a.group_order_index! - b.group_order_index!)
                                                        .map((user, idx) => (
                                                            <PerioderOptions
                                                                member={user}
                                                                key={user.ressursnummer}
                                                                itemData={itemData}
                                                                setItemData={setItemData}
                                                                index={idx}
                                                            />
                                                        ))}
                                                </SortableContext>
                                            </Table.Body>
                                        </Table>
                                    </DndContext>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <SchedulePreview
                                            groupId={selectedVaktlag}
                                            userIds={itemData
                                                .filter((user: User) => user.group_order_index !== 100)
                                                .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
                                                .map((user: User) => user.id)}
                                            startTimestamp={startTimestamp || (selectedDay ? selectedDay.getTime() / 1000 : 0)}
                                            endTimestamp={endTimestamp}
                                            rolloverDay={rolloverDay}
                                            rolloverTime={rolloverTime}
                                            disabled={response.length !== 0 || endTimestamp == 0}
                                            onConfirm={() => {
                                                createSchedule(
                                                    itemData.filter((user: User) => user.group_order_index !== 100),
                                                    selectedVaktlag,
                                                    setResponse,
                                                    startTimestamp || (selectedDay ? selectedDay.getTime() / 1000 : 0),
                                                    endTimestamp,
                                                    isMidlertidlig,
                                                    rolloverDay,
                                                    setResponseError,
                                                    rolloverTime
                                                )
                                            }}
                                        />
                                        <Button
                                            disabled={response.length !== 0 || endTimestamp == 0}
                                            style={{
                                                minWidth: '210px',
                                                marginBottom: '15px',
                                            }}
                                            onClick={() => {
                                                createSchedule(
                                                    itemData.filter((user: User) => user.group_order_index !== 100),
                                                    selectedVaktlag,
                                                    setResponse,
                                                    startTimestamp || (selectedDay ? selectedDay.getTime() / 1000 : 0),
                                                    endTimestamp,
                                                    isMidlertidlig,
                                                    rolloverDay,
                                                    setResponseError,
                                                    rolloverTime
                                                )
                                            }}
                                        >
                                            Generer vaktperioder (direkte)
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Tabs.Panel>

                        <Tabs.Panel value="administrer" style={{ marginTop: '2vh' }}>
                            <div style={{ maxWidth: '800px' }}>
                                <BulkDeleteSchedules
                                    groupId={selectedVaktlag}
                                    onDeleted={() => {
                                        setResponse([])
                                    }}
                                />
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            )}
        </>
    )
}

export default Vaktperioder
