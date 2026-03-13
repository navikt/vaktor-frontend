import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const { groupId } = req.query

    if (req.method === 'DELETE') {
        const { user_id } = req.query
        if (!user_id) {
            res.status(400).json({ error: 'user_id er påkrevd' })
            return
        }
        const path = `${process.env.BACKEND_URL}/api/v1/groups/${groupId}/members/${user_id}`
        try {
            const backendResponse = await fetch(path, {
                method: 'DELETE',
                headers: { Authorization: authorizationHeader },
            })
            if (backendResponse.ok) {
                res.status(200).json({ success: true })
            } else {
                const body = await backendResponse.json()
                res.status(backendResponse.status).json(body)
            }
        } catch (error) {
            console.error(error)
            res.status(500).send('Something went wrong')
        }
        return
    }

    const path = `${process.env.BACKEND_URL}/api/v1/groups/${groupId}/members`

    try {
        const backendResponse = await fetch(path, {
            method: 'POST',
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        })

        if (backendResponse.ok) {
            const body = await backendResponse.json()
            res.status(200).json(body)
        } else {
            const body = await backendResponse.json()
            res.status(backendResponse.status).json(body)
        }
    } catch (error) {
        console.error(error)
        res.status(500).send('Something went wrong')
    }
}
