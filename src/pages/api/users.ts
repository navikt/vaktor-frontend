import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    let path = `${process.env.BACKEND_URL}/api/v1/users/`

    try {
        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        const body = await backendResponse.json()

        if (backendResponse.ok) {
            res.status(200).json(body)
        } else {
            res.status(500).send('Failed to get data from backend')
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
}
