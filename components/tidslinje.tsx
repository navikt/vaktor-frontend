import Timeline from "react-calendar-timeline";
import { useState, useEffect } from "react";
import moment from "moment";

function Tidslinje() {
  const [groupData, setGroupData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
  vaktlagList.map((vaktlag: any) => {
    groups.push({ title: vaktlag.name, id: vaktlag.id, stackItems: true });
  });

  const date = (timestamp: number) => {
    let formatDate = moment.unix(timestamp);
    return formatDate;
  };

  const itemList: any = itemData;
  const items: any = [];
  itemList.map((itemObj: any) => {
    console.log(itemObj);
    items.push({
      id: itemObj.id,
      start_time: date(itemObj.start_timestamp),
      end_time: date(itemObj.end_timestamp),
      title: itemObj.active_user_id,
      group: itemObj.group_id,
    });
  });

  return (
    <Timeline
      groups={groups}
      items={items}
      defaultTimeStart={moment().add(-12, "hour")}
      defaultTimeEnd={moment().add(12, "hour")}
      minZoom={86400000}
    />
  );
}

export default Tidslinje;
