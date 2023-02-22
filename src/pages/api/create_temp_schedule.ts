import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"
    //let authorizationHeader = process.env.FAKE_TOKEN
    //
    // for local testing

    let start_timestamp = req.query.start_timestamp
    let end_timestamp = req.query.end_timestamp
    let group_id = req.query.group_id
    let user_id = req.query.user_id

    let body = {
        "user_id": user_id,
        "group_id": group_id,
        "start_timestamp": start_timestamp,
        "end_timestamp": end_timestamp
    }

    let path = `${process.env.BACKEND_URL}/api/v1/schedules/create_temp_schedule`
    console.log("API body: ", body)

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(body),
    })

    if (backendResponse.ok) {
        await backendResponse.json().then((body) => {
            if (body) {
                res.status(200).json(body)
            } else {
                res.send('Cant get data from backend')
            }
        })
    } else {
        const errorMessage = await backendResponse.json()
        res.status(backendResponse.status)
        res.json(errorMessage)
    }
}
