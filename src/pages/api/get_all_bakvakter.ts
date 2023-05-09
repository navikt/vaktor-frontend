import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

        if (process.env.FAKE_TOKEN) {
            authorizationHeader = process.env.FAKE_TOKEN
        }

        const type = encodeURIComponent(req.query.type as string)

        if (!type) {
            return res.status(400).json({ message: 'Missing required parameter type' })
        }

        const path = `${process.env.BACKEND_URL}/api/v1/admin/all_schedules_bakvakter?type=${type}`

        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
            method: 'GET',
        })

        const body = await backendResponse.json()

        if (backendResponse.ok && body) {
            res.status(200).json(body)
        } else {
            res.status(500).json({ message: 'Unable to retrieve schedules' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
