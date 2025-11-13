import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    try {
        const { group_id, start_timestamp, months, rollover_day, rollover_time } = req.query

        const path = `${process.env.BACKEND_URL}/api/v1/schedules/preview?group_id=${group_id}&start_timestamp=${start_timestamp}&months=${months}&rollover_day=${rollover_day}&rollover_time=${rollover_time}`

        const backendResponse = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        })

        const body = await backendResponse.json()

        if (backendResponse.ok && body) {
            res.status(200).json(body)
        } else {
            res.status(backendResponse.status).json(body)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Unable to preview schedule' })
    }
}
