import { NextApiRequest, NextApiResponse } from "next"
import { User } from "../../types/types"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // for prod / dev
    let authorizationHeader =
        req.headers && req.headers.authorization
            ? req.headers.authorization
            : "No Authorization header";
    //let authorizationHeader = process.env.FAKE_TOKEN

    // for local testing
    let group_id = String(req.query.group_id)
    //["5dfb2622-51b1-40b9-8f8d-a6c4e0d8f998","1145760b-659f-47ad-839e-1a1c7153e805"]

    const getGroupMembers = async (groupPath: string) =>
        await fetch(groupPath, {
            headers: { Authorization: authorizationHeader },
            method: "GET",
        })

    const allGroupMembers = async (group_ids: string) => {
        let groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${group_id}/members`
        let schedule = await getGroupMembers(groupPath)
        return await schedule.json()
    }

    let members: User[] = await allGroupMembers(group_id)

    let unique = members.filter(
        (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
    )

    if (members.length != 0) {
        res.status(200).json(unique)
    } else {
        res.send("Cant get data from backend")
    }
}
