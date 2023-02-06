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
    //let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"
    // for local testing

    let schedule_id = req.query.schedule_id
    let selectedVakthaver = req.query.selectedVakthaver
    let group_id = req.query.group_id
    let dateFrom = req.query.dateFrom
    let dateTo = req.query.dateTo
    let action = req.query.action

    var bodycontent = (
        {
            "schedule_id": schedule_id,
            "group_id": group_id,
            "user_id": String(selectedVakthaver).toUpperCase(),
            "start_timestamp": Number(dateFrom),
            "end_timestamp": Number(dateTo),
            "approve_level": 0,
            "type": action === "replace" ? "ordinær vakt" : action,
        }
    );
    
    if (action === "replace")(
        Object.assign(bodycontent, {"id": schedule_id})
    )

    let path = `${process.env.BACKEND_URL}/api/v1/schedules/${schedule_id}?action=${action}`

    //console.log(JSON.stringify(bodycontent), path)

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(bodycontent),
    })

    await backendResponse.json().then((body) => {
        if (body) {
            res.status(200).json(body)
        } else {
            res.send("Cant get data from backend")
        }
    })

}
