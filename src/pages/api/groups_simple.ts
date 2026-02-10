import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

        if (process.env.FAKE_TOKEN) {
            authorizationHeader = process.env.FAKE_TOKEN
        }

        const path = `${process.env.BACKEND_URL}/api/v1/groups/simple`

        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        const body = await backendResponse.json()

        if (backendResponse.ok && body) {
            res.status(200).json(body)
        } else {
            res.status(500).json({ message: 'Unable to fetch groups' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
