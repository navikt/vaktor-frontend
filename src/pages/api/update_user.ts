import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    //let authorizationHeader = process.env.FAKE_TOKEN

    try {
        let user = JSON.parse(req.body)
        // validate user object
        if (!user || !user.id) {
            throw new Error('Invalid user object')
        }

        const sanitizedValue = encodeURIComponent(user.id)

        let path = `${process.env.BACKEND_URL}/api/v1/users/${sanitizedValue}`

        const fetchOptions = {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'PUT',
            body: JSON.stringify(user),
        }

        const backendResponse = await fetch(path, fetchOptions)

        if (backendResponse.ok) {
            const responseData = await backendResponse.json()
            res.status(200).json(responseData)
        } else {
            const errorMessage = await backendResponse.json()
            res.status(backendResponse.status).json({ message: errorMessage.message || 'Unable to update user data' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error occurred while processing your request.' })
    }
}
