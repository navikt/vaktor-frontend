import Timeline, { TimelineHeaders, SidebarHeader, DateHeader, CustomMarker, CursorMarker } from 'react-calendar-timeline'
import { useState, useEffect, useRef } from 'react'
import { Moment } from 'moment'
import { colorPicker, setGrpColor, setBorderColor, setTextColor, setInterruptionColor } from './utils/SetColors'
import { Information, Left, Right } from '@navikt/ds-icons'
import GroupDetailsModal from './GroupDetailsModal'
import ItemDetailsModal from './ItemDetailsModal'
import { BodyShort, Label, Loader, Search, DatePicker, useRangeDatepicker, Button, HStack, ToggleGroup } from '@navikt/ds-react'
import moment from 'moment'
import { Schedules, User, Vaktlag } from '../types/types'
import Overview from './OverviewNoTimeline'
import { useAuth } from '../context/AuthContext'

let today = Date.now()

const DateRangePicker = ({ onRangeSelected }: { onRangeSelected: (start: number, end: number) => void }) => {
    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: new Date('2022-10-01'),
        toDate: new Date('2027-12-31'),
        onRangeChange: (range) => {
            if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
                const startOfDay = moment(range.from).startOf('day').valueOf()
                const endOfDay = moment(range.to).endOf('day').valueOf()
                onRangeSelected(startOfDay, endOfDay)
            }
        },
    })

    return (
        <DatePicker {...datepickerProps} strategy="fixed">
            <HStack gap="space-2">
                <DatePicker.Input {...fromInputProps} label="Fra" size="small" />
                <DatePicker.Input {...toInputProps} label="Til" size="small" />
            </HStack>
        </DatePicker>
    )
}

function VaktorTimeline() {
    const { user } = useAuth()
    const [groupData, setGroupData] = useState(null)
    //const [itemData, setItemData] = useState(null)
    const [itemData, setItemData] = useState<Array<any> | null>(null)

    const [isLoading, setLoading] = useState(false)

    const [grpModalOpen, setGrpModalOpen] = useState(false)
    const [grpName, setGrpName] = useState('')
    const [grpType, setGrpType] = useState('')
    const [grpPhone, setGrpPhone] = useState('')

    const [itemModalOpen, setItemModalOpen] = useState(false)
    const [itemUserName, setItemUserName] = useState('')
    const [itemGrpName, setItemGrpName] = useState('')
    const [itemGrpId, setItemGrpId] = useState('')
    const [itemDescription, setItemDescription] = useState('')
    const [itemTelephone, setItemTelephone] = useState('')
    const [itemStartTime, setItemStartTime] = useState('')
    const [itemEndTime, setItemEndTime] = useState('')
    const [itemUser, setItemUser] = useState<User | undefined>(undefined)
    const [itemScheduleId, setItemScheduleId] = useState('')

    const [searchFilter, setSearchFilter] = useState('')
    const [vaktlagTypeFilter, setVaktlagTypeFilter] = useState<'alle' | 'midlertidig' | 'fast'>('alle')

    const [visibleTimeStart, setVisibleTimeStart] = useState(Math.floor(moment().startOf('isoWeek').valueOf()))
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(Math.floor(moment().startOf('isoWeek').add(8, 'day').valueOf()))
    const [timeUnit, setTimeUnit] = useState('week')
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)
    const lastManualUpdate = useRef<number>(0)
    const [datePickerKey, setDatePickerKey] = useState(0)

    const handleRangeSelected = (start: number, end: number) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current)
        }
        debounceTimer.current = setTimeout(() => {
            lastManualUpdate.current = Date.now()
            setVisibleTimeStart(start)
            setVisibleTimeEnd(end)
        }, 500)
    }

    const onPrevClick = () => {
        if (timeUnit === 'week') {
            let newVisibleTimeStart = moment(visibleTimeStart).add(-1, 'week').startOf('week').valueOf()
            let newVisibleTimeEnd = moment(visibleTimeStart).add(-1, 'week').endOf('week').valueOf()
            setVisibleTimeStart(newVisibleTimeStart)
            setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (timeUnit === 'month') {
            let newVisibleTimeStart = moment(visibleTimeStart).add(-1, 'month').startOf('month').valueOf()
            let newVisibleTimeEnd = moment(visibleTimeStart).add(-1, 'month').endOf('month').valueOf()
            setVisibleTimeStart(newVisibleTimeStart)
            setVisibleTimeEnd(newVisibleTimeEnd)
        }
    }

    const onNextClick = () => {
        if (timeUnit === 'week') {
            let newVisibleTimeStart = moment(visibleTimeStart).add(1, 'week').startOf('week').valueOf()
            let newVisibleTimeEnd = moment(visibleTimeStart).add(1, 'week').endOf('week').valueOf()
            setVisibleTimeStart(newVisibleTimeStart)
            setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (timeUnit === 'month') {
            let newVisibleTimeStart = moment(visibleTimeStart).add(1, 'month').startOf('month').valueOf()
            let newVisibleTimeEnd = moment(visibleTimeStart).add(1, 'month').endOf('month').valueOf()
            setVisibleTimeStart(newVisibleTimeStart)
            setVisibleTimeEnd(newVisibleTimeEnd)
        }
    }

    const handleTimeHeaderChange = (unit: string) => {
        setTimeUnit(unit)

        if (unit === 'week') {
            setVisibleTimeStart(moment().startOf('week').valueOf())
            setVisibleTimeEnd(moment().endOf('week').valueOf())
        }
        if (unit === 'month') {
            setVisibleTimeStart(moment().startOf('month').valueOf())
            setVisibleTimeEnd(moment().endOf('month').valueOf())
        }
    }

    const date = (timestamp: number) => {
        let formatDate = moment.unix(timestamp)
        return formatDate
    }

    const formattedDate = (date: number | Moment) => {
        let formattedDate = moment(date).format('DD/MM/YY HH:mm')
        return formattedDate
    }

    const handleTimeChange = (visibleTimeStart: number, visibleTimeEnd: number) => {
        setVisibleTimeStart(visibleTimeStart)
        setVisibleTimeEnd(visibleTimeEnd)
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                let start = Math.floor(visibleTimeStart / 1000) - 7 * 24 * 60 * 60
                let end = Math.floor(visibleTimeEnd / 1000)

                const [groupRes, scheduleRes] = await Promise.all([
                    fetch('/api/groups_simple'),
                    fetch(`/api/schedules_with_limit?start_timestamp=${start}&end_timestamp=${end}`),
                ])

                const groupjson = await groupRes.json()
                const schedulejson = await scheduleRes.json()

                setGroupData(groupjson)
                setItemData(schedulejson)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [visibleTimeStart])

    if (!groupData) return <p>No profile data</p>

    /*
  --  Generating groups (vaktlag) -- 
  */

    const groupDataList: any = groupData

    // Sorter etter type: fast, delvis dekning, midlertidig
    const groupsSorted = [...groupDataList].sort((a, b) => {
        const getTypePriority = (type: string) => {
            if (type === 'Midlertidlig') return 3
            if (type.includes('Delvis dekning')) return 2
            return 1 // Fast (inkluderer Døgnkontinuerlig (24/7) og Delvis dekning)
        }

        const priorityA = getTypePriority(a.type)
        const priorityB = getTypePriority(b.type)

        if (priorityA !== priorityB) {
            return priorityA - priorityB
        }

        // Innenfor samme gruppe, sorter alfabetisk
        return a.name.localeCompare(b.name)
    })

    const groups: any = []
    const groupColorList: any = []

    const groupTitle = (title: string) => {
        return title.length > 22 ? <>{title.substring(0, 21)}&hellip;</> : title
    }

    const updateGrpModal = (modalstate: boolean, groupname: string, grouptype: string, groupPhone: string) => {
        setGrpModalOpen(modalstate)
        setGrpName(groupname)
        setGrpType(grouptype)
        setGrpPhone(groupPhone)
    }

    groupsSorted
        .filter((vaktlag: Vaktlag) => vaktlag.name.toLowerCase().includes(searchFilter.toLowerCase()))
        .filter((vaktlag: Vaktlag) => {
            if (vaktlagTypeFilter === 'midlertidig') return vaktlag.type === 'Midlertidlig'
            if (vaktlagTypeFilter === 'fast') return vaktlag.type !== 'Midlertidlig'
            return true
        })
        .map((vaktlag: any, index: number) => {
            groupColorList.push({
                group: vaktlag.id,
                color: colorPicker(index),
            })
            let groupName = vaktlag.name
            let groupType = vaktlag.type
            let groupPhone = vaktlag.phone

            const isPartialCoverage = groupType.includes('Delvis dekning')
            const isTemporary = groupType === 'Midlertidlig'

            groups.push({
                title: (
                    <div
                        className="groupsClickable"
                        onMouseDown={(e) => {
                            e.stopPropagation()
                            updateGrpModal(!grpModalOpen, groupName, groupType, groupPhone)
                        }}
                        title={isPartialCoverage ? groupType : undefined}
                    >
                        <div className="sidebar-text">
                            <Label>{groupTitle(groupName)}</Label>
                            {isPartialCoverage && <div className="coverage-indicator">{groupType.match(/\(([^)]+)\)/)?.[1] || ''}</div>}
                            {isTemporary && <div className="coverage-indicator">Midlertidig</div>}
                        </div>
                        <div className="sidebar-icon">
                            <Information />
                        </div>
                    </div>
                ),
                id: vaktlag.id,
                stackItems: vaktlag.type === 'Midlertidlig',
                className: isPartialCoverage ? 'partial-coverage' : isTemporary ? 'temporary' : '',
            })
        })

    /*
  --  Generating items (vaktplaner) from schedules -- 
  */

    const itemList: any = itemData
    const items: any = []
    const itemTitle = (name: string) => {
        return timeUnit === 'year' ? '' : name
    }

    const updateItemModal = (
        modalstate: boolean,
        name: string,
        groupName: string,
        description: string,
        telephone: string,
        startTime: string,
        endTime: string,
        groupId: string,
        user: User,
        schedule_id: string
    ) => {
        setItemModalOpen(modalstate)
        setItemUserName(name)
        setItemUser(user)
        setItemGrpName(groupName)
        setItemDescription(description)
        setItemTelephone(telephone)
        setItemStartTime(startTime)
        setItemEndTime(endTime)
        setItemGrpId(groupId)
        setItemScheduleId(schedule_id)
    }

    itemList
        .filter((vakt: Schedules) => vakt.type === 'ordinær vakt')
        .map((itemObj: Schedules) => {
            let itemColor = setGrpColor(groupColorList, itemObj.group_id)
            let borderColor = setBorderColor(itemColor)
            let textColor = setTextColor(itemColor)
            let itemStart = date(itemObj.start_timestamp)
            let itemEnd = date(itemObj.end_timestamp)
            items.push({
                id: itemObj.id,
                start_time: itemStart,
                end_time: itemEnd,
                title: <BodyShort>{itemTitle(itemObj.user.name)}</BodyShort>,
                group: itemObj.group_id,
                itemProps: {
                    onMouseDown: () => {
                        updateItemModal(
                            !itemModalOpen,
                            itemObj.user.name,
                            itemObj.group.name,
                            itemObj.user.description,
                            itemObj.group.phone,
                            formattedDate(itemStart),
                            formattedDate(itemEnd),
                            itemObj.group_id,
                            itemObj.user,
                            itemObj.id
                        )
                    },

                    style: {
                        background: itemColor,
                        color: textColor,
                        borderColor: borderColor,
                        borderWidth: '2.5px',
                        fontSize: '12px',
                        borderRadius: '20px',
                    },
                },
            })

            /*
  --  Generating items (vaktplaner) from interruptions in schedules -- 
  */

            if (itemObj.vakter !== undefined) {
                let itemInterruptions = itemObj.vakter.filter((vakt: Schedules) => ['bytte', 'bistand'].includes(vakt.type))

                itemInterruptions.map((interruptionObj: Schedules) => {
                    let interruptionColor = setInterruptionColor(groupColorList, interruptionObj.group_id)
                    let textColor = setTextColor(interruptionColor)
                    let borderColor = setBorderColor(interruptionColor)
                    let interruptionStart = date(interruptionObj.start_timestamp)
                    let interruptionEnd = date(interruptionObj.end_timestamp)

                    items.push({
                        id: interruptionObj.id,
                        start_time: interruptionStart,
                        end_time: interruptionEnd,
                        title: <BodyShort>{interruptionObj.user.name}</BodyShort>,
                        group: interruptionObj.group_id,
                        itemProps: {
                            //fjernet til innholdet i interruptions er likt som schedule
                            onMouseDown: () => {
                                updateItemModal(
                                    !itemModalOpen,
                                    interruptionObj.user.id === 'A123456' ? interruptionObj.group.phone : interruptionObj.user.name,
                                    interruptionObj.group.name,
                                    interruptionObj.user.description,
                                    interruptionObj.group.phone,
                                    formattedDate(interruptionStart),
                                    formattedDate(interruptionEnd),
                                    interruptionObj.group_id,
                                    interruptionObj.user,
                                    interruptionObj.id
                                )
                            },

                            style: {
                                background: interruptionColor,
                                color: textColor,
                                borderColor: borderColor,
                                borderWidth: '2.5px',
                                fontSize: '12px',
                                borderRadius: '20px',
                                maxWidth: '100%',
                                overflow: 'hidden',
                            },
                        },
                    })
                })
            }
        })

    /*
  --  Returning timeline component -- 
  */

    const verticalLineClassNamesForTime = (timeStart: number, timeEnd: number) => {
        const currentTimeStart = moment(timeStart)
        const currentTimeEnd = moment(timeEnd)

        let classes: string[] = []

        // check for public holidays
        for (let holiday of holidays) {
            if (holiday.isSame(currentTimeStart, 'day') && holiday.isSame(currentTimeEnd, 'day')) {
                classes.push('holiday')
            }
        }
        return classes
    }

    const format = 'DD.MM.YYYY'
    const holidays = [
        // 2022
        moment('01.01.2022', format), // Lørdag 1. januar: 1. nyttårsdag
        moment('10.04.2022', format), // Søndag 10. april: Palmesøndag
        moment('14.04.2022', format), // Torsdag 14. april: Skjærtorsdag
        moment('15.04.2022', format), // Fredag 15. april: Langfredag
        moment('17.04.2022', format), // Søndag 17. april: 1. påskedag
        moment('18.04.2022', format), // Mandag 18. april: 2. påskedag
        moment('01.05.2022', format), // Søndag 1. mai: Offentlig høytidsdag
        moment('17.05.2022', format), // Tirsdag 17. mai: Grunnlovsdag
        moment('26.05.2022', format), // Torsdag 26. mai: Kristi Himmelfartsdag
        moment('04.06.2022', format), // Lørdag 4. juni: 1. pinsedag
        moment('05.06.2022', format), // Søndag 5. juni: 2. pinsedag
        moment('25.12.2022', format), // Mandag 25. desember: 1. juledag
        moment('26.12.2022', format), // Tirsdag 26. desember: 2. juledag
        // 2023
        moment('01.01.2023', format), // Søndag 1. januar: 1. nyttårsdag
        moment('02.04.2023', format), // Søndag 2. april: Palmesøndag
        moment('06.04.2023', format), // Torsdag 6. april: Skjærtorsdag
        moment('07.04.2023', format), // Fredag 7. april: Langfredag
        moment('09.04.2023', format), // Søndag 9. april: 1. påskedag
        moment('10.04.2023', format), // Mandag 10. april: 2. påskedag
        moment('01.05.2023', format), // Mandag 1. mai: Offentlig høytidsdag
        moment('17.05.2023', format), // Onsdag 17. mai: Grunnlovsdag
        moment('18.05.2023', format), // Torsdag 18. mai: Kristi Himmelfartsdag
        moment('28.05.2023', format), // Søndag 28. mai: 1. pinsedag
        moment('29.05.2023', format), // Mandag 29. mai: 2. pinsedag
        moment('25.12.2023', format), // Mandag 25. desember: 1. juledag
        moment('26.12.2023', format), // Tirsdag 26. desember: 2. juledag
        // 2024
        moment('01.01.2024', format), // Tirsdag 1. januar: 1. nyttårsdag
        moment('24.03.2024', format), // Søndag 24. mars: Palmesøndag
        moment('28.03.2024', format), // Torsdag 28. mars: Skjærtorsdag
        moment('29.03.2024', format), // Fredag 29. mars: Langfredag
        moment('31.03.2024', format), // Søndag 31. mars: 1. påskedag
        moment('01.04.2024', format), // Mandag 1. april: 2. påskedag
        moment('01.05.2024', format), // Onsdag 1. mai: Offentlig høytidsdag
        moment('17.05.2024', format), // Fredag 17. mai: Grunnlovsdag
        moment('09.05.2024', format), // Torsdag 9. mai: Kristi Himmelfartsdag
        moment('19.05.2024', format), // Søndag 19. mai: 1. pinsedag
        moment('20.05.2024', format), // Mandag 20. mai: 2. pinsedag
        moment('25.12.2024', format), // Onsdag 25. desember: 1. juledag
        moment('26.12.2024', format), // Torsdag 26. desember: 2. juledag
        // Helligdager i 2025
        moment('01.01.2025', format), // Onsdag 1. januar: 1. nyttårsdag
        moment('13.04.2025', format), // Søndag 13. april: Palmesøndag
        moment('17.04.2025', format), // Torsdag 17. april: Skjærtorsdag
        moment('18.04.2025', format), // Fredag 18. april: Langfredag
        moment('20.04.2025', format), // Søndag 20. april: 1. påskedag
        moment('21.04.2025', format), // Mandag 21. april: 2. påskedag
        moment('01.05.2025', format), // Torsdag 1. mai: Offentlig høytidsdag
        moment('17.05.2025', format), // Lørdag 17. mai: Grunnlovsdag
        moment('29.05.2025', format), // Torsdag 29. mai: Kristi Himmelfartsdag
        moment('08.06.2025', format), // Søndag 8. juni: 1. pinsedag
        moment('09.06.2025', format), // Mandag 9. juni: 2. pinsedag
        moment('25.12.2025', format), // Torsdag 25. desember: 1. juledag
        moment('26.12.2025', format), // Fredag 26. desember: 2. juledag
        // Helligdager i 2026
        moment('01.01.2026', format), // Torsdag 1. januar: 1. nyttårsdag
        moment('29.03.2026', format), // Søndag 29. mars: Palmesøndag
        moment('02.04.2026', format), // Torsdag 2. april: Skjærtorsdag
        moment('03.04.2026', format), // Fredag 3. april: Langfredag
        moment('05.04.2026', format), // Søndag 5. april: 1. påskedag
        moment('06.04.2026', format), // Mandag 6. april: 2. påskedag
        moment('01.05.2026', format), // Fredag 1. mai: Offentlig høytidsdag
        moment('17.05.2026', format), // Søndag 17. mai: Grunnlovsdag
        moment('14.05.2026', format), // Torsdag 14. mai: Kristi Himmelfartsdag
        moment('24.05.2026', format), // Søndag 24. mai: 1. pinsedag
        moment('25.05.2026', format), // Mandag 25. mai: 2. pinsedag
        moment('25.12.2026', format), // Fredag 25. desember: 1. juledag
        moment('26.12.2026', format), // Lørdag 26. desember: 2. juledag
    ]

    return (
        <div>
            {itemData && itemData[0] && itemData[0].user_id === 'A123456' ? (
                <Overview groups={groupsSorted} />
            ) : (
                <>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '20px',
                            marginTop: '32px',
                            marginBottom: '24px',
                            alignItems: 'flex-end',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <form style={{ width: '200px', minWidth: '200px', maxWidth: '300px' }}>
                                <Search
                                    label="Søk etter vaktlag"
                                    hideLabel={false}
                                    variant="simple"
                                    size="small"
                                    onChange={(text) => setSearchFilter(text)}
                                />
                            </form>
                            <ToggleGroup
                                value={vaktlagTypeFilter}
                                onChange={(val) => setVaktlagTypeFilter(val as 'alle' | 'midlertidig' | 'fast')}
                                size="small"
                                label="Vakttype"
                            >
                                <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
                                <ToggleGroup.Item value="fast">Faste</ToggleGroup.Item>
                                <ToggleGroup.Item value="midlertidig">Midlertidige</ToggleGroup.Item>
                            </ToggleGroup>
                            {isLoading && <Loader variant="neutral" size="2xlarge" title="venter..." />}
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <DateRangePicker key={datePickerKey} onRangeSelected={handleRangeSelected} />

                            <Button size="small" variant="secondary" onClick={() => setDatePickerKey((prev) => prev + 1)}>
                                Nullstill
                            </Button>

                            <div className="timeframe-btns">
                                <Button size="small" variant="secondary" onClick={() => handleTimeHeaderChange('week')}>
                                    Uke
                                </Button>
                                <Button size="small" variant="secondary" onClick={() => handleTimeHeaderChange('month')}>
                                    Måned
                                </Button>
                            </div>

                            <HStack gap="space-2">
                                <Button size="small" variant="secondary" onClick={() => onPrevClick()} icon={<Left />} />
                                <Button size="small" variant="secondary" onClick={() => onNextClick()} icon={<Right />} />
                            </HStack>
                        </div>
                    </div>

                    <Timeline
                        groups={groups}
                        items={items}
                        traditionalZoom={true}
                        sidebarContent="Vaktlag"
                        itemHeightRatio={0.8}
                        sidebarWidth={240}
                        lineHeight={45}
                        canMove={false}
                        buffer={1}
                        visibleTimeStart={visibleTimeStart}
                        visibleTimeEnd={visibleTimeEnd}
                        onTimeChange={handleTimeChange}
                        verticalLineClassNamesForTime={verticalLineClassNamesForTime}
                    >
                        <TimelineHeaders className="sticky">
                            <SidebarHeader>
                                {({ getRootProps }) => {
                                    return (
                                        <div {...getRootProps()}>
                                            <div className="sidebar-header-text">Vaktlag:</div>
                                        </div>
                                    )
                                }}
                            </SidebarHeader>
                            <DateHeader unit="primaryHeader" />
                            <CustomMarker date={today}>
                                {/* custom renderer for this marker */}
                                {({ styles, date }) => {
                                    const customStyles = {
                                        ...styles,
                                        backgroundColor: 'red',
                                        width: '10px',
                                        zindex: '100',
                                    }
                                    return <div style={customStyles} />
                                }}
                            </CustomMarker>
                            <CursorMarker />
                            <DateHeader unit="day" />
                        </TimelineHeaders>
                    </Timeline>
                    {grpModalOpen && (
                        <GroupDetailsModal
                            handleClose={() => setGrpModalOpen(false)}
                            groupName={grpName}
                            groupType={grpType}
                            groupTelephone={grpPhone}
                        />
                    )}
                    {itemModalOpen && (
                        <ItemDetailsModal
                            handleClose={() => setItemModalOpen(false)}
                            userName={itemUserName}
                            groupName={itemGrpName}
                            description={itemDescription}
                            telephone={itemTelephone}
                            startTime={itemStartTime}
                            endTime={itemEndTime}
                            canEdit={user.id.toUpperCase() === itemUser!.id ? true : false}
                            user={itemUser!}
                            schedule_id={itemScheduleId}
                        />
                    )}
                </>
            )}
        </div>
    )
}
export default VaktorTimeline
