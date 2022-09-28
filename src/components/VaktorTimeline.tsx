import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
} from "react-calendar-timeline";
import { useState, useEffect } from "react";
import { Moment } from "moment";
import { colorPicker, setGrpColor } from "./SetColors";
import { InformationColored } from "@navikt/ds-icons";
import GroupDetailsModal from "./GroupDetailsModal";
import ItemDetailsModal from "./ItemDetailsModal";
import { Button, Label } from "@navikt/ds-react";
import styled from "styled-components";
import moment from "moment";

const InfoTextWrapper = styled.div`
  display: inline-block;
  position: relative;
`;

const IconWrapper = styled.div`
  float: right;
  position: absolute;
  top: 4px;
  left: 207px;
`;

const sideBarHeaderText = styled.div`
  margin: auto;
  width: 50%;
  padding: 10px;
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

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemUsername, setItemUsername] = useState("");
  const [itemGrpName, setItemGrpName] = useState("");
  const [itemStartTime, setItemStartTime] = useState("");
  const [itemEndTime, setItemEndTime] = useState("");

  useEffect(() => {
    setLoading(true);

    Promise.all([fetch("api/groups"), fetch("api/schedules")])
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

  if (isLoading) return <p>Loading...</p>;
  if (!groupData) return <p>No profile data</p>;

  const vaktlagList: any = groupData;
  const groups: any = [];
  const groupColorList: any = [];

  const updateGrpModal = (groupname: string, modalstate: boolean) => {
    setGrpModalOpen(modalstate);
    setGrpName(groupname);
  };

  vaktlagList.map((vaktlag: any, index: number) => {
    groupColorList.push({ group: vaktlag.id, color: colorPicker(index) });
    let groupName = vaktlag.name;

    groups.push({
      title: (
        <div onClick={() => updateGrpModal(groupName, !grpModalOpen)}>
          <InfoTextWrapper>
            {groupName}
            <IconWrapper>
              <InformationColored />
            </IconWrapper>
          </InfoTextWrapper>
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
    let formattedDate = moment(date).format("DD/MM/YYYY");
    return formattedDate;
  };

  const itemList: any = itemData;
  const items: any = [];

  const updateItemModal = (
    modalstate: boolean,
    name: string,
    groupName: string,
    startTime: string,
    endTime: string
  ) => {
    setItemModalOpen(modalstate);
    setItemUsername(name);
    setItemGrpName(groupName);
    setItemStartTime(startTime);
    setItemEndTime(endTime);
  };

  itemList.map((itemObj: any) => {
    //console.log(itemObj);

    const itemColor = setGrpColor(groupColorList, itemObj.group_id);
    const borderColor = tinycolor(itemColor)
      .darken(70)
      .setAlpha(0.3)
      .toString();
    const textColor = tinycolor(itemColor).darken(82).toString();
    let itemStart = date(itemObj.start_timestamp);
    let itemEnd = date(itemObj.end_timestamp);

    items.push({
      id: itemObj.id,
      start_time: itemStart,
      end_time: itemEnd,
      title: itemObj.user.name,
      group: itemObj.group_id,
      itemProps: {
        onMouseDown: () => {
          updateItemModal(
            !itemModalOpen,
            itemObj.user_name,
            itemObj.group_name,
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
        defaultTimeStart={moment().startOf("isoWeek")}
        defaultTimeEnd={moment().endOf("isoWeek")}
        minZoom={86400000}
        sidebarContent="Vaktlag"
        itemHeightRatio={0.8}
        sidebarWidth={240}
        lineHeight={45}
        canMove={false}
      ></Timeline>

      {grpModalOpen && (
        <GroupDetailsModal
          handleClose={() => setGrpModalOpen(false)}
          groupName={grpName}
        />
      )}
      {itemModalOpen && (
        <ItemDetailsModal
          handleClose={() => setItemModalOpen(false)}
          userName={itemUsername}
          groupName={itemGrpName}
          startTime={itemStartTime}
          endTime={itemEndTime}
        />
      )}
    </div>
  );
}
export default VaktorTimeline;
