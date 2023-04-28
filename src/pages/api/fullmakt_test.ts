import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // for prod / dev
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    console.log(authorizationHeader)
    let path = `${process.env.BACKEND_URL}/api/v1/admin/test_fullmakt`
    //let path = `https://fullmaktsregister-api.intern.dev.nav.no/api/v1/fullmakter`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
    })

    console.log(backendResponse)
    await backendResponse.json().then((body) => {
        if (body) {
            console.log('body: ', body)
            //res.status(200).json(body)
        } else {
            res.send('Cant get data from backend')
        }
    })
}
