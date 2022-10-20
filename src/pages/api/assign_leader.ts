import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"

    // for local testing
    //let authorizationHeader = process.env.FAKE_TOKEN

    let group_id = req.query.group_id
    console.log("req", group_id)
    let path = `https://vaktor-plan-api.dev.intern.nav.no/api/v1/leaders/${group_id}/add`

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