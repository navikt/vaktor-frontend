import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const group_id = encodeURIComponent(req.query.group_id as string)

    if (!group_id) {
        return res.status(400).json({ message: 'Missing required parameter group_id' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/leaders/${group_id}/remove`

    try {
        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
            method: 'POST',
        })

        const responseBody = await backendResponse.json()

        if (backendResponse.ok) {
            res.status(200).json(responseBody)
        } else {
            res.status(500).json({ message: 'Unable to remove leader from group' })
        }
    } catch (error) {
        console.error('Error occurred while trying to remove leader from group:', error)
        res.status(500).json({ message: 'Unable to remove leader from group' })
    }
}
