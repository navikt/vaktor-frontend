import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TodayMarker,
} from "react-calendar-timeline";
import { useState, useEffect } from "react";
import { Moment } from "moment";
import { colorPicker, setGrpColor } from "./SetColors";
import { InformationColored, Left, Right } from "@navikt/ds-icons";
import GroupDetailsModal from "./GroupDetailsModal";
import ItemDetailsModal from "./ItemDetailsModal";
import { BodyShort, Label, Loader, Button } from "@navikt/ds-react";
import styled from "styled-components";
import moment from "moment";

const NavigateBtn = styled.div`
  position: absolute;
  display: inline-block;
  z-index: 2;
  margin-right: 1px;
  right: 0px;
  background-color: #0067c5;
  height: 31.5px;
  top: 0px;
`;

const Timeframebtns = styled.div`
  display: inline-block;
  margin-top: -10px;
  position: relative;
  top: -5px;
`;

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
`;

const SidebarIcon = styled.div`
  position: absolute;
  top: 4px;
  left: 200px;
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
  require("moment/min/locales.min");
  moment.locale("no");

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
  const [scrolling, setScrolling] = useState();

  const onPrevClick = () => {
    if (timeUnit === "week") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(-1, "week")
        .startOf("week")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(-1, "week")
        .endOf("week")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (timeUnit === "month") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(-1, "month")
        .startOf("month")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(-1, "month")
        .endOf("month")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (timeUnit === "year") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(-1, "year")
        .startOf("year")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(-1, "year")
        .endOf("year")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
  };

  const onNextClick = () => {
    if (timeUnit === "week") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(1, "week")
        .startOf("week")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(1, "week")
        .endOf("week")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (timeUnit === "month") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(1, "month")
        .startOf("month")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(1, "month")
        .endOf("month")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (timeUnit === "year") {
      let newVisibleTimeStart = moment(visibleTimeStart)
        .add(1, "year")
        .startOf("year")
        .valueOf();
      let newVisibleTimeEnd = moment(visibleTimeStart)
        .add(1, "year")
        .endOf("year")
        .valueOf();
      setVisibleTimeStart(newVisibleTimeStart);
      setVisibleTimeEnd(newVisibleTimeEnd);
    }
  };

  const handleTimeChange = (
    visibleTimeStart: number,
    visibleTimeEnd: number
  ) => {
    setVisibleTimeStart(visibleTimeStart);
    setVisibleTimeEnd(visibleTimeEnd);
    scrolling;
  };

  const handleTimeHeaderChange = (unit: string) => {
    setTimeUnit(unit);
    if (timeUnit === "week") {
      setVisibleTimeStart(moment().startOf("week").valueOf());
      setVisibleTimeEnd(moment().endOf("week").valueOf());
    }
    if (timeUnit === "month") {
      setVisibleTimeStart(moment().startOf("month").valueOf());
      setVisibleTimeEnd(moment().endOf("month").valueOf());
    }
    if (timeUnit === "year") {
      setVisibleTimeStart(moment().startOf("year").valueOf());
      setVisibleTimeEnd(moment().endOf("year").valueOf());
    }
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

  const vaktlagList: any = groupData;
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

  vaktlagList.map((vaktlag: any, index: number) => {
    groupColorList.push({ group: vaktlag.id, color: colorPicker(index) });
    let groupName = vaktlag.name;
    let groupType = vaktlag.type;
    let groupPhone = vaktlag.phone;

    groups.push({
      title: (
        <div
          onClick={() =>
            updateGrpModal(!grpModalOpen, groupName, groupType, groupPhone)
          }
        >
          <SidebarText>
            <Label>{groupName}</Label>
            <SidebarIcon>
              <InformationColored />
            </SidebarIcon>
          </SidebarText>
        </div>
      ),
      id: vaktlag.id,
    });
  });

  const date = (timestamp: number) => {
    let formatDate = moment.unix(timestamp);
    return formatDate;
  };

  const formattedDate = (date: number | Moment) => {
    let formattedDate = moment(date).format("DD/MM/YY");
    return formattedDate;
  };

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
    //console.log(itemObj);

    let itemColor = setGrpColor(groupColorList, itemObj.group_id);
    const borderColor = tinycolor(itemColor)
      .darken(70)
      .setAlpha(0.22)
      .toString();
    const textColor = tinycolor(itemColor).darken(80).toString();
    let itemStart = date(itemObj.start_timestamp);
    let itemEnd = date(itemObj.end_timestamp);
    let itemDescription = itemObj.user.description;
    let itemPhone = itemObj.group.phone;

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
            itemDescription,
            itemPhone,
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
  });

  return (
    <div>
      <Timeline
        groups={groups}
        items={items}
        minZoom={86400000}
        sidebarContent="Vaktlag"
        itemHeightRatio={0.8}
        sidebarWidth={240}
        lineHeight={45}
        canMove={false}
        defaultTimeStart={moment().startOf("isoWeek")}
        defaultTimeEnd={moment().endOf("isoWeek")}
      >
        <TimelineHeaders>
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
        />
      )}
    </div>
  );
}
export default VaktorTimeline;
