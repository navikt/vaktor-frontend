import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import { useState, useEffect } from 'react'
import moment from 'moment'

function Tidslinje() {

const [groupData, setGroupData] = useState(null)
const [itemData, setItemData] = useState(null)
const [isLoading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  Promise.all([
  fetch('https://vaktor-plan-api.dev.intern.nav.no/api/v1/groups/'),
  fetch('https://vaktor-plan-api.dev.intern.nav.no/api/v1/schedules/')
]).then(async([groupRes,scheduleRes]) => {
const groups = await groupRes.json(); 
const schedules = await scheduleRes.json(); 
return[groups, schedules]
})
    .then(([groupData, itemData]) => {
      setGroupData(groupData)
      setItemData(itemData)
      setLoading(false)
    })
}, [])

if (isLoading) return <p>Loading...</p>
if (!groupData) return <p>No profile data</p>

const vaktlagList:any = groupData;
const groups:any = []
vaktlagList.map((vaktlag:any) =>{
  groups.push({title:vaktlag.name, id: vaktlag.id, stackItems:true})
})

const itemList:any = itemData;
const items:any = []
itemList.map((itemObj:any) =>{
  items.push({id: itemObj.id, start_time: moment().subtract(5,'hour'),
  end_time: moment().add(4, 'hour'), title: itemObj.active_user_id, group: itemObj.group_id })
})

    return  (
                <Timeline
                    groups={groups}
                    items={items}
                    defaultTimeStart={moment().add(-12, 'hour')}
                    defaultTimeEnd={moment().add(12, 'hour')}
                />)
                
}

 export default Tidslinje;