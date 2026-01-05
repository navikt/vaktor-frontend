import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ detail: 'Method not allowed' })
    }

    const { group_id, start_timestamp, end_timestamp } = req.query
    const token = req.headers.authorization

    if (!group_id || !start_timestamp || !end_timestamp) {
        return res.status(400).json({ detail: 'Missing required query parameters' })
    }

    try {
        const backendUrl = `${process.env.BACKEND_URL}/api/v1/schedules/bulk_delete?group_id=${group_id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}`

        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        })

        const data = await response.json()

        if (!response.ok) {
            return res.status(response.status).json(data)
        }

        return res.status(200).json(data)
    } catch (error) {
        console.error('Error proxying bulk delete:', error)
        return res.status(500).json({ detail: 'Internal server error' })
    }
}
