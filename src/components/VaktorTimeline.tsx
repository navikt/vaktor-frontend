import Timeline, {
    TimelineHeaders,
    SidebarHeader,
    DateHeader,
} from "react-calendar-timeline"
import { useState, useEffect } from "react"
import { Moment } from "moment"
import {
    colorPicker,
    setGrpColor,
    setBorderColor,
    setTextColor,
    setInterruptionColor,
} from "./SetColors"
import { Information } from "@navikt/ds-icons"
import GroupDetailsModal from "./GroupDetailsModal"
import ItemDetailsModal from "./ItemDetailsModal"
import { BodyShort, Label, Loader, Button, Search } from "@navikt/ds-react"
import styled from "styled-components"
import moment from "moment"
import { Spring, animated, AnimatedProps } from "react-spring"
import { NavigationButtons } from "./NavigationButtons"
import { FluidValue } from "@react-spring/shared"
import { Schedules, User, Vaktlag } from "../types/types"
import Overview from "./OverviewNoTimeline"
import { isCryptoKey } from "util/types"

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
    const [groupData, setGroupData] = useState(null)
    const [userData, setUserData] = useState({} as User)
    const [itemData, setItemData] = useState(null)
    const [isLoading, setLoading] = useState(false)

    const [grpModalOpen, setGrpModalOpen] = useState(false)
    const [grpName, setGrpName] = useState("")
    const [grpType, setGrpType] = useState("")
    const [grpPhone, setGrpPhone] = useState("")

    const [itemModalOpen, setItemModalOpen] = useState(false)
    const [itemUserName, setItemUserName] = useState("")
    const [itemGrpName, setItemGrpName] = useState("")
    const [itemGrpId, setItemGrpId] = useState("")
    const [itemDescription, setItemDescription] = useState("")
    const [itemTelephone, setItemTelephone] = useState("")
    const [itemStartTime, setItemStartTime] = useState("")
    const [itemEndTime, setItemEndTime] = useState("")
    const [itemUser, setItemUser] = useState<User | undefined>(undefined)

    const [searchFilter, setSearchFilter] = useState("")

    const [visibleTimeStart, setVisibleTimeStart] = useState(
        moment().startOf("isoWeek").valueOf()
    )
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(
        moment().startOf("isoWeek").add(7, "day").valueOf()
    )
    const [timeUnit, setTimeUnit] = useState("week")

    const date = (timestamp: number) => {
        let formatDate = moment.unix(timestamp)
        return formatDate
    }

    const formattedDate = (date: number | Moment) => {
        let formattedDate = moment(date).format("DD/MM/YY HH:mm")
        return formattedDate
    }

    const handleTimeChange = (
        visibleTimeStart: number,
        visibleTimeEnd: number
    ) => {
        setVisibleTimeStart(visibleTimeStart)
        setVisibleTimeEnd(visibleTimeEnd)
    }

    useEffect(() => {
        setLoading(true)

        Promise.all([
            fetch("vaktor/api/groups"),
            fetch("vaktor/api/schedules"),
            fetch("/vaktor/api/get_me"),
        ])
            .then(async ([groupRes, scheduleRes, userRes]) => {
                const groupjson = await groupRes.json()
                const schedulejson = await scheduleRes.json()
                const userjson = await userRes.json()
                return [groupjson, schedulejson, userjson]
            })
            .then(([groupData, itemData, userData]) => {
                setGroupData(groupData)
                setItemData(itemData)
                setUserData(userData)
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
    const groupsSorted1 = [...groupDataList].sort((a, b) =>
        a.name < b.name ? 1 : -1
    )
    const groupsSorted = [...groupsSorted1].sort((a, b) =>
        a.type === "Døgnkontinuerlig (24/7)" ? -1 : 1
    )

    const groups: any = []
    const groupColorList: any = []

    const groupTitle = (title: string) => {
        return title.length > 22 ? <>{title.substring(0, 21)}&hellip;</> : title
    }

    const updateGrpModal = (
        modalstate: boolean,
        groupname: string,
        grouptype: string,
        groupPhone: string
    ) => {
        setGrpModalOpen(modalstate)
        setGrpName(groupname)
        setGrpType(grouptype)
        setGrpPhone(groupPhone)
    }

    groupsSorted
        .filter((vaktlag: Vaktlag) =>
            vaktlag.name.toLowerCase().includes(searchFilter.toLowerCase())
        )
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
                    <div
                        className="groupsClickable"
                        onClick={() =>
                            updateGrpModal(
                                !grpModalOpen,
                                groupName,
                                groupType,
                                groupPhone
                            )
                        }
                    >
                        <SidebarText>
                            <Label>{groupTitle(groupName)}</Label>
                            <SidebarIcon>
                                <Information />
                            </SidebarIcon>
                        </SidebarText>
                    </div>
                ),
                id: vaktlag.id,
                stackItems: false,
            })
        })

    /*
  --  Generating items (vaktplaner) from schedules -- 
  */

    const itemList: any = itemData
    const items: any = []
    const itemTitle = (name: string) => {
        return timeUnit === "year" ? "" : name
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
        .filter((vakt: Schedules) => vakt.type === "ordinær vakt")
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
                        borderWidth: "2.5px",
                        fontSize: "12px",
                        borderRadius: "20px",
                    },
                },
            })

            /*
  --  Generating items (vaktplaner) from interruptions in schedules -- 
  */

            if (itemObj.vakter !== undefined) {
                let itemInterruptions = itemObj.vakter.filter(
                    (vakt: Schedules) =>
                        ["bytte", "bistand"].includes(vakt.type)
                )

                itemInterruptions.map((interruptionObj: Schedules) => {
                    let interruptionColor = setInterruptionColor(
                        groupColorList,
                        interruptionObj.group_id
                    )
                    let textColor = setTextColor(interruptionColor)
                    let borderColor = setBorderColor(interruptionColor)
                    let interruptionStart = date(
                        interruptionObj.start_timestamp
                    )
                    let interruptionEnd = date(interruptionObj.end_timestamp)

                    items.push({
                        id: interruptionObj.id,
                        start_time: interruptionStart,
                        end_time: interruptionEnd,
                        title: (
                            <BodyShort>{interruptionObj.user.name}</BodyShort>
                        ),
                        group: interruptionObj.group_id,
                        itemProps: {
                            //fjernet til innholdet i interruptions er likt som schedule
                            onMouseDown: () => {
                                updateItemModal(
                                    !itemModalOpen,
                                    interruptionObj.user.id === "A123456"
                                        ? interruptionObj.group.phone
                                        : interruptionObj.user.name,
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
                                borderWidth: "2.5px",
                                fontSize: "12px",
                                borderRadius: "20px",
                                zIndex: 100,
                                overflow: "hidden",
                            },
                        },
                    })
                })
            }
        })

    /*
  --  Returning timeline component -- 
  */

    const AnimatedTimeline = animated(
        ({
            animatedVisibleTimeStart,
            animatedVisibleTimeEnd,
            visibleTimeStart,
            visibleTimeEnd,
            ...props
        }) => (
            <Timeline
                visibleTimeStart={animatedVisibleTimeStart}
                visibleTimeEnd={animatedVisibleTimeEnd}
                {...props}
            />
        )
    )

    return (
        <div>
            {itemData[0].user_id === "A123456" ? (
                <Overview groups={groupsSorted} />
            ) : (
                <>
                    <form style={{ width: "400px", marginBottom: "10px" }}>
                        <Search
                            label="Søk etter vaktlag"
                            hideLabel={false}
                            variant="simple"
                            onChange={(text) => setSearchFilter(text)}
                        />
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
                                    scrollTop?:
                                        | number
                                        | FluidValue<number, any>
                                        | undefined
                                    scrollLeft?:
                                        | number
                                        | FluidValue<number, any>
                                        | undefined
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
                                onTimeChange={() =>
                                    handleTimeChange(
                                        visibleTimeStart,
                                        visibleTimeEnd
                                    )
                                }
                                {...value}
                            >
                                <TimelineHeaders className="sticky">
                                    <NavigationButtons
                                        timeStart={visibleTimeStart}
                                        timeUnit={timeUnit}
                                        setVisibleTimeStart={
                                            setVisibleTimeStart
                                        }
                                        setVisibleTimeEnd={setVisibleTimeEnd}
                                        setTimeUnit={setTimeUnit}
                                    />
                                    <SidebarHeader>
                                        {({ getRootProps }) => {
                                            return (
                                                <div {...getRootProps()}>
                                                    <SidebarHeaderText>
                                                        Vaktlag:
                                                    </SidebarHeaderText>
                                                </div>
                                            )
                                        }}
                                    </SidebarHeader>
                                    <DateHeader unit="primaryHeader" />
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
                            canEdit={
                                userData.id.toUpperCase() === itemUser!.id
                                    ? true
                                    : false
                            }
                            user={itemUser!}
                        />
                    )}
                </>
            )}
        </div>
    )
}
export default VaktorTimeline
