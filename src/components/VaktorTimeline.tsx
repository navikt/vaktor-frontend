import Timeline from "react-calendar-timeline";
import { useState, useEffect } from "react";
import moment from "moment";
import { colorPicker, setGrpColor } from "./SetColors";
import { InformationColored } from "@navikt/ds-icons";
import GroupDetailsModal from "./GroupDetailsModal";
import { Button, Label } from "@navikt/ds-react";
import SidebarRow from "./SidebarRow";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [grpName, setGrpName] = useState("");
  const [isLoading, setLoading] = useState(false);

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

  const updateModal = (groupname: string, modalstate: boolean) => {
    setModalOpen(modalstate);
    setGrpName(groupname);
  };

  vaktlagList.map((vaktlag: any, index: number) => {
    groupColorList.push({ group: vaktlag.id, color: colorPicker(index) });
    let name = vaktlag.name;

    groups.push({
      title: (
        <div onClick={() => updateModal(name, !modalOpen)}>
          <InfoTextWrapper>
            {name}
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

  itemList.map((itemObj: any) => {
    //console.log(itemObj);

    const itemColor = setGrpColor(groupColorList, itemObj.group_id);
    const borderColor = tinycolor(itemColor).darken(6).toString();
    const textColor = tinycolor(itemColor).darken(85).toString();

    items.push({
      id: itemObj.id,
      start_time: date(itemObj.start_timestamp),
      end_time: date(itemObj.end_timestamp),
      title: itemObj.active_user_name,
      group: itemObj.group_id,
      itemProps: {
        onMouseDown: () => {},
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

      {modalOpen && (
        <GroupDetailsModal
          handleClose={() => setModalOpen(false)}
          groupName={grpName}
        />
      )}
    </div>
  );
}
export default VaktorTimeline;
