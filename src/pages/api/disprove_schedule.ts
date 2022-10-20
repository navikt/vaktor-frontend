import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // for prod
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"

    // for local testing
    //let authorizationHeader = process.env.FAKE_TOKEN

    let schedule_id = req.query.schedule_id
    let path = `https://vaktor-plan-api.dev.intern.nav.no/api/v1/schedules/${schedule_id}/disprove`

    const backendResponse = await fetch(
        path,
        {
            headers: { 'Authorization': authorizationHeader },
            method: "POST",
        },

    )

    await backendResponse.json()
        .then(body => {
            if (body) {
                res.status(200).json(body)
            }
            else {
                res.send("Cant get data from backend")
            }

        })
}