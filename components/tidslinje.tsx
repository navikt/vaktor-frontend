import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
import { useState, useEffect } from 'react'
import moment from 'moment'

function Tidslinje() {



const items = [
  {
    id: 1,
    group: "e679c310-7767-42de-b287-e0b51d410dd1",
    title: 'item 1',
    start_time: moment().subtract(5,'hour'),
    end_time: moment().add(4, 'hour')
  },
 
  {
    id: 2,
    group: "3fb3bdcb-f30b-438d-8991-e37640946cdf",
    title: 'item 3',
    start_time: moment().add(-0.5, 'hour'),
    end_time: moment().add(0.5, 'hour')
  },
  {
    id: 3,
    group: 1,
    title: 'item 3',
    start_time: moment().add(2, 'hour'),
    end_time: moment().add(3, 'hour')
  }
]

const [groupData, setGroupData] = useState(null)
const [isLoading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetch('https://vaktor-plan-api.dev.intern.nav.no/api/v1/groups/')
    .then((res) => res.json())
    .then((groupData) => {
      setGroupData(groupData)
      setLoading(false)
    })
}, [])

if (isLoading) return <p>Loading...</p>
if (!groupData) return <p>No profile data</p>


const vaktlagList:any = groupData;
const groups:any = []
vaktlagList.map((vaktlag:any) =>{
  groups.push({title:vaktlag.name, id: vaktlag.id})
})

console.log(groups)



    return  (
                <Timeline
                    groups={groups}
                    items={items}
                    defaultTimeStart={moment().add(-12, 'hour')}
                    defaultTimeEnd={moment().add(12, 'hour')}
                />)
                

}


 export default Tidslinje;