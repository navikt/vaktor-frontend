import Timeline from "react-calendar-timeline";
import { useState, useEffect } from "react";
import moment from "moment";
import { colorPicker, setGrpColor } from "./setColors";
import { InformationColored } from "@navikt/ds-icons";

function Tidslinje() {
  var tinycolor = require("tinycolor2");
  const [groupData, setGroupData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("api/schedules")
      .then((response) => response.json())
      .then((data) => console.log(data));

    Promise.all([
      fetch("https://vaktor-plan-api.dev.intern.nav.no/api/v1/groups/"),
      fetch("https://vaktor-plan-api.dev.intern.nav.no/api/v1/schedules/"),
    ])
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

  const formatSidebar = (grpName: String) => {
    return (
      <div style={{ marginLeft: "3px" }}>
        <InformationColored />

        {grpName}
      </div>
    );
  };

  vaktlagList.map((vaktlag: any, index: number) => {
    groupColorList.push({ group: vaktlag.id, color: colorPicker(index) });
    let name = vaktlag.name;

    groups.push({
      title: formatSidebar(vaktlag.name),
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
    const borderColor = tinycolor(itemColor).darken(5).toString();
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
          fontSize: "12px",
          borderRadius: "20px",
          borderWidth: "2px",
        },
      },
    });
  });

  return (
    <Timeline
      groups={groups}
      items={items}
      defaultTimeStart={moment().add(-12, "hour")}
      defaultTimeEnd={moment().add(12, "hour")}
      minZoom={86400000}
      sidebarContent="Vaktlag"
      itemHeightRatio={0.85}
      sidebarWidth={240}
      lineHeight={45}
      canMove={false}
    />
  );
}

export default Tidslinje;
