import { NextApiRequest, NextApiResponse } from 'next'

interface ScheduleRequest {
    start_timestamp: number
    end_timestamp: number
    action_reason: number
    approve_level: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const start_timestamp = parseInt(encodeURIComponent(req.query.start_timestamp as string) as string)
    const end_timestamp = parseInt(encodeURIComponent(req.query.end_timestamp as string) as string)
    const action_reason = parseInt(encodeURIComponent(req.query.action_reason as string) as string)
    const approve_level = parseInt(encodeURIComponent(req.query.approve_level as string) as string)

    const body: ScheduleRequest = {
        start_timestamp,
        end_timestamp,
        action_reason,
        approve_level,
    }

    const path = `${process.env.BACKEND_URL}/api/v1/admin/rekjoring?start_timestamp=${start_timestamp}&end_timetamp=${end_timestamp}&action_reason=${action_reason}&approve_level=${approve_level}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        //        body: JSON.stringify(body),
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
