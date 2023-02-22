import { NextApiRequest, NextApiResponse } from 'next'
import { Schedules, User, Vaktlag } from '../../types/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    //let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"
    // for local testing

    let path = `${process.env.BACKEND_URL}/api/v1/users/me`

    const getCurrentUser = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'GET',
    }).then((res) => res.json())

    //let groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${getCurrentUser.groups[0].id}/schedules`

    const getGroupSchedule = async (groupPath: string) =>
        await fetch(groupPath, {
            headers: { Authorization: authorizationHeader },
            method: 'GET',
        })

    const allGroupSchedule = async (user: User) =>
        await Promise.all(
            user.groups.map(async (group: Vaktlag) => {
                let groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${group.id}/schedules`
                let schedule = await getGroupSchedule(groupPath)
                return await schedule.json()
            })
        )

    let schedules = await allGroupSchedule(getCurrentUser)
    let list_of_schedules: Schedules[] = []

    schedules.forEach((s) => (list_of_schedules = [...list_of_schedules, ...s]))

    if (list_of_schedules.length != 0) {
        res.status(200).json(list_of_schedules)
    } else {
        res.send('Cant get data from backend')
    }
}
