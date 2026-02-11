import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ detail: 'Method not allowed' })
    }

    let token = req.headers.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        token = process.env.FAKE_TOKEN
    }

    const { group_id, entity_type, action, limit, offset } = req.query

    try {
        const params = new URLSearchParams()
        if (group_id) params.append('group_id', group_id as string)
        if (entity_type) params.append('entity_type', entity_type as string)
        if (action) params.append('action', action as string)
        if (limit) params.append('limit', limit as string)
        if (offset) params.append('offset', offset as string)

        const backendUrl = `${process.env.BACKEND_URL}/api/v1/audit/?${params.toString()}`

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return res.status(response.status).json(data)
        }

        return res.status(200).json(data)
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return res.status(500).json({ detail: 'Internal server error' })
    }
}
