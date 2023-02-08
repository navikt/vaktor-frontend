import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    //
    // for local testing
    //let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : "No Authorization header"

    let user = JSON.parse(req.body)
    //console.log("user: ", user)

    let path = `${process.env.BACKEND_URL}/api/v1/users/${user.id}`

    const backendResponse = await fetch(path, {
        headers: {
            Authorization: authorizationHeader,
            'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(user),
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
