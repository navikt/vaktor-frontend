import { NextApiRequest, NextApiResponse } from 'next'

interface ScheduleRequest {
    schedule_ids: string[]
    action_reason: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const schedule_ids = req.body.schedule_ids
    const action_reason = parseInt(encodeURIComponent(req.query.action_reason as string) as string)

    const path = `${process.env.BACKEND_URL}/api/v1/okonomi/rekjoring?&action_reason=${action_reason}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(schedule_ids),
    })

    //console.log(body)
    console.log('Path and queries used:', path)

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
