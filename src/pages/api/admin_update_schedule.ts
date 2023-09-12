import { NextApiRequest, NextApiResponse } from 'next'

interface RequestBody {
    id?: string
    group_id: string
    user_id: string
    start_timestamp: number
    end_timestamp: number
    type: string
    approve_level: number
    is_double: boolean
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method Not Allowed' })
    }

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const codeQLfix = encodeURIComponent(authorizationHeader)
    const incomingData: RequestBody = req.body

    // Extract only the required fields from the incoming JSON object
    const { id, group_id, user_id, start_timestamp, end_timestamp, type, approve_level, is_double } = incomingData

    if (!id || !start_timestamp || !end_timestamp) {
        return res.status(400).json({ message: 'Missing required parameters' })
    }

    const bodycontent: RequestBody = {
        id,
        group_id,
        user_id,
        start_timestamp,
        end_timestamp,
        type,
        approve_level,
        is_double,
    }

    console.log('Posting to url: ', `${process.env.BACKEND_URL}/api/v1/admin/update_schedule/${bodycontent.id}`)
    console.log('Bodycontent: ', JSON.stringify(bodycontent))

    if (!bodycontent.id || !bodycontent.start_timestamp || !bodycontent.end_timestamp) {
        return res.status(400).json({ message: 'Missing required parameters' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/admin/update_schedule/${bodycontent.id}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: codeQLfix,
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(bodycontent),
    })

    if (backendResponse.ok) {
        const responseBody = await backendResponse.json()
        res.status(200).json(responseBody)
    } else {
        // Handle the error response here
        const errorResponse = await backendResponse.json()
        const errorMessage = errorResponse.message || 'Unable to update schedule'
        res.status(500).json({ message: errorMessage })
    }
}
