import { NextApiRequest, NextApiResponse } from "next"
import { User } from "../../types/types"

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
    let group_ids = req.body
    //["5dfb2622-51b1-40b9-8f8d-a6c4e0d8f998","1145760b-659f-47ad-839e-1a1c7153e805"]

    group_ids = group_ids
        .replace("[", "")
        .replace("]", "")
        .replaceAll('"', "")
        .split(",")

    const getGroupMembers = async (groupPath: string) =>
        await fetch(groupPath, {
            headers: { Authorization: authorizationHeader },
            method: "GET",
        })

    const allGroupMembers = async (group_ids: string[]) =>
        await Promise.all(
            group_ids.map(async (group_id: string) => {
                let groupPath = `${process.env.BACKEND_URL}/api/v1/groups/${group_id}/members`
                let schedule = await getGroupMembers(groupPath)
                return await schedule.json()
            })
        )

    let members = await allGroupMembers(group_ids)

    let list_of_members: User[] = []
    members.forEach((s) => (list_of_members = [...list_of_members, ...s]))
    let unique = list_of_members.filter(
        (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id)
    )

    if (list_of_members.length != 0) {
        res.status(200).json(unique)
    } else {
        res.send("Cant get data from backend")
    }
}
