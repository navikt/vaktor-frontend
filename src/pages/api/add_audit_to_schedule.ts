import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }
    console.log(req.body)

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/${req.body.schedule_id}/audit?action=${req.body.action}`
    try {
        const backendResponse = await fetch(path, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })

        if (backendResponse.ok) {
            const responseBody = await backendResponse.json()
            res.status(200).json(responseBody)
        } else {
            const errorMessage = await backendResponse.json()
            res.status(backendResponse.status).json(errorMessage)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
}
