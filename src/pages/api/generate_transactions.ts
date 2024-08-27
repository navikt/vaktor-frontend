import { NextApiRequest, NextApiResponse } from 'next'

interface ScheduleRequest {
    schedule_ids: string[]
    file_type: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const schedule_ids = req.body
    const file_type = req.query.file_type
    let path

    if (file_type === '2') {
        path = `${process.env.BACKEND_URL}/api/v1/okonomi/transactions_diff`
    } else {
        path = `${process.env.BACKEND_URL}/api/v1/okonomi/transactions`
    }

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: schedule_ids,
    })

    console.log('ids: ', schedule_ids)
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
