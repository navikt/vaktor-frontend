import { NextApiRequest, NextApiResponse } from 'next'

interface QueryParams {
    group_id: string
    start_timestamp: string
    end_timestamp: string
    midlertidlig_vakt: string
    rolloverDay: string
    rolloverTime: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    let queryParams: QueryParams
    try {
        queryParams = {
            group_id: encodeURIComponent(req.query.group_id as string),
            start_timestamp: encodeURIComponent(req.query.start_timestamp as string),
            end_timestamp: encodeURIComponent(req.query.end_timestamp as string),
            midlertidlig_vakt: encodeURIComponent(req.query.midlertidlig_vakt as string),
            rolloverDay: encodeURIComponent(req.query.rolloverDay as string),
            rolloverTime: encodeURIComponent(req.query.rolloverTime as string),
        }
    } catch (error) {
        console.error('Error encoding query parameters:', error)
        res.status(400).send('Invalid query parameters')
        return
    }

    let user_order = JSON.parse(req.body)

    let path = `${process.env.BACKEND_URL}/api/v1/schedules/?group_id=${queryParams.group_id}&start_timestamp=${queryParams.start_timestamp}&end_timestamp=${queryParams.end_timestamp}&midlertidlig_vakt=${queryParams.midlertidlig_vakt}&rollover_day=${queryParams.rolloverDay}&rollover_time=${queryParams.rolloverTime}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(user_order),
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
