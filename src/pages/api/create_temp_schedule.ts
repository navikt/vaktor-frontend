import { NextApiRequest, NextApiResponse } from 'next'

interface ScheduleRequest {
    start_timestamp: string
    end_timestamp: string
    group_id: string
    user_id: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const start_timestamp = encodeURIComponent(req.query.start_timestamp as string)
    const end_timestamp = encodeURIComponent(req.query.end_timestamp as string)
    const group_id = encodeURIComponent(req.query.group_id as string)
    const user_id = encodeURIComponent(req.query.user_id as string)

    const body: ScheduleRequest = {
        user_id,
        group_id,
        start_timestamp,
        end_timestamp,
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/create_temp_schedule`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
    })

    try {
        if (backendResponse.ok) {
            const data = await backendResponse.json()
            res.status(200).json(data)
        } else {
            const errorMessage = await backendResponse.json()
            res.status(backendResponse.status).json(errorMessage)
        }
    } catch (error) {
        console.error('Error:', error)
        res.status(500).send('Internal Server Error')
    }
}
