import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    // for local testing

    let path = `${process.env.BACKEND_URL}/api/v1/admin/all_schedules/`
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
