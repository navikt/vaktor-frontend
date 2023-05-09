import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers && req.headers.authorization ? req.headers.authorization : 'No Authorization header'
    //let authorizationHeader = process.env.FAKE_TOKEN

    try {
        let schedule_id = req.query.schedule_id
        // validate schedule_id parameter
        if (!schedule_id || schedule_id === '') {
            throw new Error('Invalid schedule ID')
        }

        //let path = `${process.env.BACKEND_URL}/api/v1/schedules/${schedule_id}/confirm`
        //vaktor-plan-api.intern.dev.nav.no/
        let path = `http://vaktor-plan/api/v1/schedules/${schedule_id}/confirm`

        const fetchOptions = {
            headers: { Authorization: authorizationHeader },
            method: 'POST',
        }

        const backendResponse = await fetch(path, fetchOptions)

        if (backendResponse.ok) {
            const responseData = await backendResponse.json()
            res.status(200).json(responseData)
        } else {
            const errorMessage = await backendResponse.json()
            res.status(backendResponse.status).json({ message: errorMessage.message || 'Unable to confirm schedule' })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error occurred while processing your request.' })
    }
}
