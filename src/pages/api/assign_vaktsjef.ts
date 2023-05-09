import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authorizationHeader = req.headers?.authorization ?? 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN

    const groupId = encodeURIComponent(req.query.group_id as string)
    const userId = encodeURIComponent(req.query.user_id as string)
    const path = `${process.env.BACKEND_URL}/api/v1/groups/${groupId}/assign_vaktsjef?user_id=${userId}`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'POST',
    })

    if (backendResponse.ok) {
        const body = await backendResponse.json()
        res.status(200).json(body)
    } else {
        const errorMessage = await backendResponse.text()
        res.status(backendResponse.status).send(errorMessage)
    }
}
