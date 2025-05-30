import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }
    const start_timestamp = encodeURIComponent(req.query.start_timestamp as string)
    const end_timestamp = encodeURIComponent(req.query.end_timestamp as string)

    if (!start_timestamp && !end_timestamp) {
        return res.status(400).json({ message: 'Missing required parameter start and/or end timestamps' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/?start=${start_timestamp}&end=${end_timestamp}`

    try {
        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        if (!backendResponse.ok) {
            throw new Error(`Backend responded with status ${backendResponse.status}`)
        }

        const body = await backendResponse.json()

        res.status(200).json(body)
    } catch (error) {
        console.error('Error fetching schedules:', error)
        res.status(500).json({ message: 'Unable to get schedules' })
    }
}
