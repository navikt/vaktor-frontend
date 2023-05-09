import { NextApiRequest, NextApiResponse } from 'next'

interface GroupRequestBody {
    name: string
    phone: string
    description: string
    type: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const groupName = encodeURIComponent(req.query.name as string)
    const groupPhone = encodeURIComponent(req.query.phone as string)
    const description = encodeURIComponent(req.query.description as string)
    const groupType = encodeURIComponent(req.query.type as string)
    const teamkatalog = encodeURIComponent(req.query.teamkatalog as string)

    const requestBody: GroupRequestBody = {
        name: groupName,
        phone: groupPhone,
        description: description,
        type: groupType,
    }

    const path = `${process.env.BACKEND_URL}/api/v1/groups/`

    try {
        const backendResponse = await fetch(path, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify(requestBody),
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
