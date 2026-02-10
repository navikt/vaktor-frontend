import { NextApiRequest, NextApiResponse } from 'next'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Action should be a simple text string without special characters
const ACTION_REGEX = /^[a-zA-ZæøåÆØÅ0-9\s\-_.,:()]{1,500}$/

function isValidScheduleId(id: unknown): id is string {
    return typeof id === 'string' && UUID_REGEX.test(id)
}

function isValidAction(action: unknown): action is string {
    return typeof action === 'string' && ACTION_REGEX.test(action)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const { schedule_id, action } = req.body

    // Validate inputs to prevent SSRF
    if (!isValidScheduleId(schedule_id)) {
        return res.status(400).json({ detail: 'Invalid schedule ID format' })
    }
    if (!isValidAction(action)) {
        return res.status(400).json({ detail: 'Invalid action format' })
    }

    const path = `${process.env.BACKEND_URL}/api/v1/schedules/${encodeURIComponent(schedule_id)}/audit?action=${encodeURIComponent(action)}`
    try {
        const backendResponse = await fetch(path, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'POST',
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
