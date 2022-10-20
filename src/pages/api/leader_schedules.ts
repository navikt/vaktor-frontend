import { NextApiRequest, NextApiResponse } from "next";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    console.log("leader user schedules api")

    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"
    //let authorizationHeader = process.env.FAKE_TOKEN

    let path = "https://vaktor-plan-api.dev.intern.nav.no/api/v1/leaders/users/schedules/"
    const backendResponse = await fetch(
        path,
        {
            headers: { 'Authorization': authorizationHeader },
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