import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // for prod / dev
    /* let authorizationHeader =
    req.headers && req.headers.authorization
      ? req.headers.authorization
      : "No Authorization header"; */
    let authorizationHeader =
        req.headers && req.headers.authorization
            ? req.headers.authorization
            : "No Authorization header"
    // for local testing
    let group_id = req.query.group_id
    let groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${group_id}/members`

    const getGroupMembers = await fetch(groupPath, {
        headers: { Authorization: authorizationHeader },
        method: "GET",
    })

    await getGroupMembers.json().then((body) => {
        if (body) {
            res.status(200).json(body)
        } else {
            res.send("Cant get data from backend")
        }
    })
}
