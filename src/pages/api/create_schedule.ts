import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // for prod / dev
    let authorizationHeader =
        req.headers && req.headers.authorization
            ? req.headers.authorization
            : "No Authorization header"
    //
    // for local testing

    let start_timestamp = req.query.start_timestamp
    let end_timestamp = req.query.end_timestamp
    let group_id = req.query.group_id
    let midlertidlig_vakt = req.query.midlertidlig_vakt
    let amountOfWeeks = req.query.amountOfWeeks
    let rolloverDay = req.query.rolloverDay
    let rolloverTime = req.query.rolloverTime
    let user_order = JSON.parse(req.body)

    let path = `${process.env.BACKEND_URL}/api/v1/schedules/?group_id=${group_id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&midlertidlig_vakt=${midlertidlig_vakt}&amount_of_weeks=${amountOfWeeks}&rollover_day=${rolloverDay}&rollover_time=${rolloverTime}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(user_order),
    })

    if (backendResponse.ok) {
        await backendResponse.json().then((body) => {
            if (body) {
                res.status(200).json(body)
            } else {
                res.send("Cant get data from backend")
            }
        })
    } else {
        res.status(backendResponse.status).json(backendResponse.statusText)
    }
}
