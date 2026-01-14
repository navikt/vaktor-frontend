import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { groupId, user_id, role_title } = req.query

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    try {
        let path = `${process.env.BACKEND_URL}/api/v1/groups/${groupId}/roles`

        if (req.method === 'GET') {
            const backendResponse = await fetch(path, {
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else if (req.method === 'POST') {
            if (!user_id || !role_title) {
                return res.status(400).json({ detail: 'user_id and role_title are required' })
            }

            path += `?user_id=${user_id}&role_title=${role_title}`

            const backendResponse = await fetch(path, {
                method: 'POST',
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else if (req.method === 'DELETE') {
            if (!user_id || !role_title) {
                return res.status(400).json({ detail: 'user_id and role_title are required' })
            }

            path += `?user_id=${user_id}&role_title=${role_title}`

            const backendResponse = await fetch(path, {
                method: 'DELETE',
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ detail: 'Internal Server Error' })
    }
}
