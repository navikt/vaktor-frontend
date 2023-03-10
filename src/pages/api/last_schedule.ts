import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"
    // for local testing

    let group_id = req.query.group_id
    let path = `${process.env.BACKEND_URL}/api/v1/schedules/${group_id}/latest`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'GET',
    })

    await backendResponse.json().then((body) => {
        if (body) {
            res.status(200).json(body)
        } else {
            res.send('Cant get data from backend')
        }
    })
}