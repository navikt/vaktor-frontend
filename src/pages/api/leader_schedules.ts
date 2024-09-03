import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const start_timestamp = encodeURIComponent(req.query.start_timestamp as string)
    const end_timestamp = encodeURIComponent(req.query.end_timestamp as string)

    if (!start_timestamp && !end_timestamp) {
        return res.status(400).json({ message: 'Missing required parameter start and/or end timestamps' })
    }

    // const path = `${process.env.BACKEND_URL}/api/v1/okonomi/all_schedules_with_limit?start=${start_timestamp}&end=${end_timestamp}`

    //let path = `${process.env.BACKEND_URL}/api/v1/leaders/users/schedules`
    let path = `${process.env.BACKEND_URL}/api/v1/leaders/users/schedules_with_limit?start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}`

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
