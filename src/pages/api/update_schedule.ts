import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
    schedule_id: string
    group_id: string
    user_id: string
    start_timestamp: number
    end_timestamp: number
    approve_level: number
    type: string
    id?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers?.authorization ?? 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN
    const schedule_id = encodeURIComponent(req.query.schedule_id as string)
    const selectedVakthaver = encodeURIComponent(req.query.selectedVakthaver as string)
    const group_id = encodeURIComponent(req.query.group_id as string)
    const dateFrom = Number(req.query.dateFrom)
    const dateTo = Number(req.query.dateTo)
    const action = encodeURIComponent(req.query.action as string)

    if (!schedule_id || !selectedVakthaver || !group_id || !dateFrom || !dateTo || !action) {
        return res.status(400).json({ message: 'Missing required parameters' })
    }

    const bodycontent: RequestBody = {
        schedule_id,
        group_id,
        user_id: selectedVakthaver.toUpperCase(),
        start_timestamp: dateFrom,
        end_timestamp: dateTo,
        approve_level: 0,
        type: action === 'replace' ? 'ordinær vakt' : action,
    }

    if (action === 'replace') {
        bodycontent.id = schedule_id
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/${schedule_id}?action=${action}`
    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(bodycontent),
    })

    const responseBody = await backendResponse.json()

    if (backendResponse.ok) {
        res.status(200).json(responseBody)
    } else {
        res.status(500).json({ message: 'Unable to update schedule' })
    }
}
