import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // for prod / dev
    //let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"

    // for local testing
    let authorizationHeader: string = process.env.FAKE_TOKEN!
    let path = `https://vaktor-plan-api.dev.intern.nav.no/api/v1/users/me`

    const getCurrentUser = await fetch(
        path,
        {
            headers: { 'Authorization': authorizationHeader },
            method: "GET",
        },
    ).then(res => res.json())

    let groupPath = `https://vaktor-plan-api.dev.intern.nav.no/api/v1/groups/${getCurrentUser.groups[0].id}/schedules`

    const getGroupSchedule = await fetch(
        groupPath,
        {
            headers: { 'Authorization': authorizationHeader },
            method: "GET",
        },
    )

    await getGroupSchedule.json()
        .then(body => {
            if (body) {
                res.status(200).json(body)
            }
            else {
                res.send("Cant get data from backend")
            }

        })
}