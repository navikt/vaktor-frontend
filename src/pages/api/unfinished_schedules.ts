import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const path = `${process.env.BACKEND_URL}/api/v1/admin/unfinished_schedules`

    try {
        console.log('Path: ', path)
        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        if (backendResponse.ok) {
            const body = await backendResponse.json()
            res.status(200).json(body)
        } else {
            const errorText = await backendResponse.text()
            res.status(backendResponse.status).json({ message: errorText })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
