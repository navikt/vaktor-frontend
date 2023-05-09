import { NextApiRequest, NextApiResponse } from 'next'
import { User } from '../../types/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers?.authorization ?? 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN
    const group_id = encodeURIComponent(req.query.group_id as string)

    if (!group_id) {
        return res.status(400).json({ message: 'Missing required parameter group_id' })
    }

    const getGroupMembers = async (groupPath: string) =>
        await fetch(groupPath, {
            headers: { Authorization: authorizationHeader },
            method: 'GET',
        })

    const allGroupMembers = async (group_id: string) => {
        const groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${group_id}/members`
        const schedule = await getGroupMembers(groupPath)
        return (await schedule.json()) as User[]
    }

    const members: User[] = await allGroupMembers(group_id)

    const uniqueMembers = members.filter((value, index, self) => index === self.findIndex((t) => t.id === value.id))

    if (uniqueMembers.length !== 0) {
        res.status(200).json(uniqueMembers)
    } else {
        res.status(500).json({ message: 'Unable to get members for group' })
    }
}
