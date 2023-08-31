import Timeline, { TimelineHeaders, SidebarHeader, DateHeader, TodayMarker, CustomMarker, CursorMarker } from 'react-calendar-timeline'
import { useState, useEffect } from 'react'
import { Moment } from 'moment'
import { colorPicker, setGrpColor, setBorderColor, setTextColor, setInterruptionColor } from './SetColors'
import { Information } from '@navikt/ds-icons'
import GroupDetailsModal from './GroupDetailsModal'
import ItemDetailsModal from './ItemDetailsModal'
import { BodyShort, Label, Loader, Button, Search } from '@navikt/ds-react'
import styled from 'styled-components'
import moment from 'moment'
import { Spring, animated, AnimatedProps } from 'react-spring'
import { NavigationButtons } from './NavigationButtons'
import { FluidValue } from '@react-spring/shared'
import { Schedules, User, Vaktlag } from '../types/types'
import Overview from './OverviewNoTimeline'
import { useAuth } from '../context/AuthContext'

let today = Date.now()

const SidebarHeaderText = styled.div`
    padding-top: 25px;
    margin: auto;
    font-weight: bold;
    vertical-align: middle;
    text-align: center;
    font-size: 20px;
`

export const SidebarText = styled.div`
    display: inline-block;
    position: relative;
    left: 6px;
    opacity: 1 !important;
`

const SidebarIcon = styled.div`
    position: absolute;
    top: 4px;
    left: 200px;
    width: 250px;
    opacity: 0.6;
`

const LoadingWrapper = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
`

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

    const [searchFilter, setSearchFilter] = useState('')

    const [visibleTimeStart, setVisibleTimeStart] = useState(moment().startOf('isoWeek').valueOf())
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(moment().startOf('isoWeek').add(7, 'day').valueOf())
    const [timeUnit, setTimeUnit] = useState('week')

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
        setLoading(true)

        Promise.all([fetch('vaktor/api/groups'), fetch('vaktor/api/schedules')])
            .then(async ([groupRes, scheduleRes]) => {
                const groupjson = await groupRes.json()
                const schedulejson = await scheduleRes.json()
                return [groupjson, schedulejson]
            })
            .then(([groupData, itemData]) => {
                setGroupData(groupData)
                setItemData(itemData)
                setLoading(false)
            })
    }, [])

    if (isLoading)
        return (
            <LoadingWrapper>
                <Loader variant="neutral" size="3xlarge" title="venter..." />
            </LoadingWrapper>
        )
    if (!groupData) return <p>No profile data</p>

    /*
  --  Generating groups (vaktlag) -- 
  */

    const groupDataList: any = groupData
    const groupsSorted1 = [...groupDataList].sort((a, b) => (a.name < b.name ? 1 : -1))
    const groupsSorted = [...groupsSorted1].sort((a, b) => (a.type === 'Døgnkontinuerlig (24/7)' ? -1 : 1))

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
        .map((vaktlag: any, index: number) => {
            groupColorList.push({
                group: vaktlag.id,
                color: colorPicker(index),
            })
            let groupName = vaktlag.name
            let groupType = vaktlag.type
            let groupPhone = vaktlag.phone

            groups.push({
                title: (
                    <div className="groupsClickable" onClick={() => updateGrpModal(!grpModalOpen, groupName, groupType, groupPhone)}>
                        <SidebarText>
                            <Label>{groupTitle(groupName)}</Label>
                            <SidebarIcon>
                                <Information />
                            </SidebarIcon>
                        </SidebarText>
                    </div>
                ),
                id: vaktlag.id,
                stackItems: vaktlag.type === 'Midlertidlig',
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
        user: User
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
                            itemObj.user
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
                                    interruptionObj.user
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

    const verticalLineClassNamesForTime = (timeStart: Date, timeEnd: Date) => {
        const currentTimeStart = moment(timeStart)
        const currentTimeEnd = moment(timeEnd)

        let classes = []

        // check for public holidays
        for (let holiday of holidays) {
            if (holiday.isSame(currentTimeStart, 'day') && holiday.isSame(currentTimeEnd, 'day')) {
                classes.push('holiday')
            }
        }
        return classes
    }

    const helgedager = []

    const format = 'DD.MM.YYYY'
    const holidays = [
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
    ]

    const AnimatedTimeline = animated(({ animatedVisibleTimeStart, animatedVisibleTimeEnd, visibleTimeStart, visibleTimeEnd, ...props }) => (
        <Timeline
            visibleTimeStart={animatedVisibleTimeStart}
            visibleTimeEnd={animatedVisibleTimeEnd}
            verticalLineClassNamesForTime={verticalLineClassNamesForTime}
            {...props}
        />
    ))

    return (
        <div>
            {itemData && itemData[0] && itemData[0].user_id === 'A123456' ? (
                <Overview groups={groupsSorted} />
            ) : (
                <>
                    <form style={{ width: '400px', marginBottom: '10px' }}>
                        <Search label="Søk etter vaktlag" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                    </form>

                    <Spring
                        to={{
                            animatedVisibleTimeStart: visibleTimeStart,
                            animatedVisibleTimeEnd: visibleTimeEnd,
                        }}
                    >
                        {(
                            value: JSX.IntrinsicAttributes &
                                AnimatedProps<{ [x: string]: any }> & {
                                    scrollTop?: number | FluidValue<number, any> | undefined
                                    scrollLeft?: number | FluidValue<number, any> | undefined
                                }
                        ) => (
                            <AnimatedTimeline
                                groups={groups}
                                items={items}
                                minZoom={86400000}
                                sidebarContent="Vaktlag"
                                itemHeightRatio={0.8}
                                sidebarWidth={240}
                                lineHeight={45}
                                canMove={false}
                                buffer={1}
                                visibleTimeStart={visibleTimeStart}
                                visibleTimeEnd={visibleTimeEnd}
                                onTimeChange={() => handleTimeChange(visibleTimeStart, visibleTimeEnd)}
                                {...value}
                            >
                                <TimelineHeaders className="sticky">
                                    <NavigationButtons
                                        timeStart={visibleTimeStart}
                                        timeUnit={timeUnit}
                                        setVisibleTimeStart={setVisibleTimeStart}
                                        setVisibleTimeEnd={setVisibleTimeEnd}
                                        setTimeUnit={setTimeUnit}
                                    />
                                    <SidebarHeader>
                                        {({ getRootProps }) => {
                                            return (
                                                <div {...getRootProps()}>
                                                    <SidebarHeaderText>Vaktlag:</SidebarHeaderText>
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
                                    <DateHeader />
                                </TimelineHeaders>
                            </AnimatedTimeline>
                        )}
                    </Spring>
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
                        />
                    )}
                </>
            )}
        </div>
    )
}
export default VaktorTimeline
