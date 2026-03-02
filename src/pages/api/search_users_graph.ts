import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const rawQuery = req.query.query

    if (typeof rawQuery !== 'string') {
        res.status(400).json({ error: 'Invalid query parameter' })
        return
    }

    const query = rawQuery

    if (!query || query.length < 2) {
        res.status(400).json({ error: 'Search query must be at least 2 characters' })
        return
    }

    const path = `${process.env.BACKEND_URL}/api/v1/users/search/graph?query=${encodeURIComponent(query)}`

    try {
        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
        })

        const body = await backendResponse.json()

        if (backendResponse.ok) {
            res.status(200).json(body)
        } else {
            res.status(backendResponse.status).json(body)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
}
