import Timeline from "react-calendar-timeline";
import { useState, useEffect } from "react";
import moment from "moment";
import { colorPicker, setGrpColor } from "./SetColors";
import { InformationColored } from "@navikt/ds-icons";
import GroupDetailsModal from "./GroupDetailsModal";
import ItemDetailsModal from "./ItemDetailsModal";
import { Button, Label } from "@navikt/ds-react";
import styled from "styled-components";

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

function VaktorTimeline() {
  var tinycolor = require("tinycolor2");

  const [groupData, setGroupData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [grpModalOpen, setGrpModalOpen] = useState(false);
  const [grpName, setGrpName] = useState("");

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemUsername, setItemUsername] = useState("");
  const [itemGrpName, setItemGrpName] = useState("");
  const [itemStartTime, setItemStartTime] = useState(0);
  const [itemEndTime, setItemEndTime] = useState(0);

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

  const itemList: any = itemData;
  const items: any = [];

  const updateItemModal = (modalstate: boolean, name: string) => {
    setItemModalOpen(modalstate);
    setItemUsername(name);
  };

  itemList.map((itemObj: any) => {
    //console.log(itemObj);

    const itemColor = setGrpColor(groupColorList, itemObj.group_id);
    const borderColor = tinycolor(itemColor).darken(6).toString();
    const textColor = tinycolor(itemColor).darken(85).toString();

    console.log(itemObj.start_timestamp);
    console.log(date(itemObj.start_timestamp));
    items.push({
      id: itemObj.id,
      start_time: date(itemObj.start_timestamp),
      end_time: date(itemObj.end_timestamp),
      title: itemObj.user_name,
      group: itemObj.group_id,
      itemProps: {
        onMouseDown: () => {
          updateItemModal(!itemModalOpen, itemObj.user_name);
        },
        style: {
          background: itemColor,
          color: textColor,
          borderColor: borderColor,
          borderWidth: "2px",
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
        defaultTimeStart={moment().add(-12, "hour")}
        defaultTimeEnd={moment().add(12, "hour")}
        minZoom={86400000}
        sidebarContent="Vaktlag"
        itemHeightRatio={0.8}
        sidebarWidth={240}
        lineHeight={45}
        canMove={false}
      />

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
        />
      )}
    </div>
  );
}
export default VaktorTimeline;
