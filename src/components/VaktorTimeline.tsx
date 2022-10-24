import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TodayMarker,
  CustomMarker,
  TimelineMarkers,
} from "react-calendar-timeline";
import { useState, useEffect } from "react";
import { Moment } from "moment";
import {
  colorPicker,
  setGrpColor,
  setBorderColor,
  setTextColor,
  setInterruptionColor,
} from "./SetColors";
import { Information } from "@navikt/ds-icons";
import GroupDetailsModal from "./GroupDetailsModal";
import ItemDetailsModal from "./ItemDetailsModal";
import { BodyShort, Label, Loader, Button } from "@navikt/ds-react";
import styled from "styled-components";
import moment from "moment";
import { Spring, animated, AnimatedProps } from "react-spring";
import { NavigationButtons } from "./NavigationButtons";
import { FluidValue } from "@react-spring/shared";

const SidebarHeaderText = styled.div`
  padding-top: 25px;

  margin: auto;
  font-weight: bold;
  vertical-align: middle;
  text-align: center;
  font-size: 20px;
`;

export const SidebarText = styled.div`
  display: inline-block;
  position: relative;
  left: 6px;
  opacity: 1 !important;
`;

const SidebarIcon = styled.div`
  position: absolute;
  top: 4px;
  left: 200px;
  width: 250px;

  opacity: 0.6;
`;

const LoadingWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

function VaktorTimeline() {
  var tinycolor = require("tinycolor2");

  const [isTouched, setIsTouched] = useState(false);
  const [color, setColor] = useState("");

  const [groupData, setGroupData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [grpModalOpen, setGrpModalOpen] = useState(false);
  const [grpName, setGrpName] = useState("");
  const [grpType, setGrpType] = useState("");
  const [grpPhone, setGrpPhone] = useState("");

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemUserName, setItemUserName] = useState("");
  const [itemGrpName, setItemGrpName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemTelephone, setItemTelephone] = useState("");
  const [itemStartTime, setItemStartTime] = useState("");
  const [itemEndTime, setItemEndTime] = useState("");

  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment().startOf("isoWeek").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment().startOf("isoWeek").add(7, "day").valueOf()
  );
  const [timeUnit, setTimeUnit] = useState("week");
  const date = (timestamp: number) => {
    let formatDate = moment.unix(timestamp);
    return formatDate;
  };

  const formattedDate = (date: number | Moment) => {
    let formattedDate = moment(date).format("DD/MM/YY");
    return formattedDate;
  };
  const [scrolling, setScrolling] = useState();

  const handleTimeChange = (
    visibleTimeStart: number,
    visibleTimeEnd: number
  ) => {
    setVisibleTimeStart(visibleTimeStart);
    setVisibleTimeEnd(visibleTimeEnd);
    scrolling;
  };

  useEffect(() => {
    setLoading(true);

    Promise.all([fetch("vaktor/api/groups"), fetch("vaktor/api/schedules")])
      .then(async ([groupRes, scheduleRes]) => {
        const groupjson = await groupRes.json();
        const schedulejson = await scheduleRes.json();
        return [groupjson, schedulejson];
      })
      .then(([groupData, itemData]) => {
        setGroupData(groupData);
        setItemData(itemData);
        setLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <LoadingWrapper>
        <Loader variant="neutral" size="3xlarge" title="venter..." />
      </LoadingWrapper>
    );
  if (!groupData) return <p>No profile data</p>;

  /*
  --  Generating groups (vaktlag) -- 
  */

  const groupDataList: any = groupData;
  const groupsSorted = [...groupDataList].sort((a, b) =>
    a.name > b.name ? 1 : -1
  );
  const groups: any = [];
  const groupColorList: any = [];

  const updateGrpModal = (
    modalstate: boolean,
    groupname: string,
    grouptype: string,
    groupPhone: string
  ) => {
    setGrpModalOpen(modalstate);
    setGrpName(groupname);
    setGrpType(grouptype);
    setGrpPhone(groupPhone);
  };

  groupsSorted.map((vaktlag: any, index: number) => {
    groupColorList.push({ group: vaktlag.id, color: colorPicker(index) });
    let groupName = vaktlag.name;
    let groupType = vaktlag.type;
    let groupPhone = vaktlag.phone;

    groups.push({
      title: (
        <div
          className="groupsClickable"
          onClick={() =>
            updateGrpModal(!grpModalOpen, groupName, groupType, groupPhone)
          }
        >
          <SidebarText>
            <Label>{groupName}</Label>
            <SidebarIcon>
              <Information />
            </SidebarIcon>
          </SidebarText>
        </div>
      ),
      id: vaktlag.id,
      stackItems: false,
    });
  });

  /*
  --  Generating items (vaktplaner) from schedules -- 
  */

  const itemList: any = itemData;
  const items: any = [];

  const updateItemModal = (
    modalstate: boolean,
    name: string,
    groupName: string,
    description: string,
    telephone: string,
    startTime: string,
    endTime: string
  ) => {
    setItemModalOpen(modalstate);
    setItemUserName(name);
    setItemGrpName(groupName);
    setItemDescription(description);
    setItemTelephone(telephone);
    setItemStartTime(startTime);
    setItemEndTime(endTime);
  };

  itemList.map((itemObj: any) => {
    let itemColor = setGrpColor(groupColorList, itemObj.group_id);
    let borderColor = setBorderColor(itemColor);
    let textColor = setTextColor(itemColor);
    let itemStart = date(itemObj.start_timestamp);
    let itemEnd = date(itemObj.end_timestamp);

    items.push({
      id: itemObj.id,
      start_time: itemStart,
      end_time: itemEnd,
      title: <BodyShort>{itemObj.user.name}</BodyShort>,
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
            formattedDate(itemEnd)
          );
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
    });

    /*
  --  Generating items (vaktplaner) from interruptions in schedules -- 
  */

    let itemInterruptions = itemObj.interruptions;

    if (itemInterruptions.length > 0) {
      itemInterruptions.map((interruptionObj: any) => {
        let interruptionColor = setInterruptionColor(
          groupColorList,
          interruptionObj.group_id
        );
        let textColor = setTextColor(interruptionColor);
        let borderColor = setBorderColor(interruptionColor);
        let interruptionStart = date(interruptionObj.start_timestamp);
        let interruptionEnd = date(interruptionObj.end_timestamp);

        items.push({
          id: interruptionObj.id,
          start_time: interruptionStart,
          end_time: interruptionEnd,
          title: <BodyShort>{interruptionObj.user.name}</BodyShort>,
          group: interruptionObj.group_id,
          itemProps: {
            onMouseDown: () => {
              updateItemModal(
                !itemModalOpen,
                interruptionObj.user.name,
                interruptionObj.group.name,
                interruptionObj.user.description,
                interruptionObj.group.phone,
                formattedDate(interruptionStart),
                formattedDate(interruptionEnd)
              );
            },

            style: {
              background: interruptionColor,
              color: textColor,
              borderColor: borderColor,
              borderWidth: "2.5px",
              fontSize: "12px",
              borderRadius: "20px",
              zIndex: 100,
            },
          },
        });
      });
    }
  });

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
  );

  return (
    <div>
      <Spring
        to={{
          animatedVisibleTimeStart: visibleTimeStart,
          animatedVisibleTimeEnd: visibleTimeEnd,
        }}
      >
        {(
          value: JSX.IntrinsicAttributes &
            AnimatedProps<{ [x: string]: any }> & {
              scrollTop?: number | FluidValue<number, any> | undefined;
              scrollLeft?: number | FluidValue<number, any> | undefined;
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
              handleTimeChange(visibleTimeStart, visibleTimeEnd)
            }
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
                  );
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
        />
      )}
    </div>
  );
}
export default VaktorTimeline;
