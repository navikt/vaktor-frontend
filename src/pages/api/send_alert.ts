import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const month: string = req.body.month
    const type: string = req.body.type
    const role: string = req.body.role

    const path = `${process.env.BACKEND_URL}/api/v1/admin/alert_leaders?month=${month}&type=${type}&role=${role}`
    console.log('Path: ', path)
    console.log('body: ', JSON.stringify(req.body.schedule_ids))
    try {
        const backendResponse = await fetch(path, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(req.body.schedule_ids),
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
