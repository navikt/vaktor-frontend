import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers?.authorization ?? 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN
    const group_id = encodeURIComponent(req.query.group_id as string)

    if (!group_id) {
        return res.status(400).json({ message: 'Missing required parameter group_id' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/${group_id}/latest`
    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'GET',
    })

    const responseBody = await backendResponse.json()

    if (backendResponse.ok) {
        res.status(200).json(responseBody)
    } else {
        res.status(500).json({ message: 'Unable to get latest schedule' })
    }
}
