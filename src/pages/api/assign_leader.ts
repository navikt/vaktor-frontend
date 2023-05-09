import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    //const authorizationHeader = process.env.FAKE_TOKEN

    const group_id = encodeURIComponent(req.query.group_id as string)
    if (!group_id) {
        res.status(400).send('Missing group ID')
        return
    }

    let path = `${process.env.BACKEND_URL}/api/v1/leaders/${group_id}/add`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
        method: 'POST',
    })

    await backendResponse.json().then((body) => {
        if (body) {
            res.status(200).json(body)
        } else {
            res.send('Cant get data from backend')
        }
    })
}
