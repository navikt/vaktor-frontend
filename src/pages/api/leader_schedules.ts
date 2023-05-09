import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    let path = `${process.env.BACKEND_URL}/api/v1/leaders/users/schedules`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
    })

    await backendResponse.json().then((body) => {
        if (body) {
            res.status(200).json(body)
        } else {
            res.send('Cant get data from backend')
        }
    })
}
