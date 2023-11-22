import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

        if (process.env.FAKE_TOKEN) {
            authorizationHeader = process.env.FAKE_TOKEN
        }

        const group_id = encodeURIComponent(req.query.group_id as string)

        if (!group_id) {
            return res.status(400).json({ message: 'Missing required parameter group_id' })
        }

        const path = `${process.env.BACKEND_URL}/api/v1/groups/${group_id}/calender`

        const backendResponse = await fetch(path, {
            headers: { Authorization: authorizationHeader },
            method: 'GET',
        })

        if (backendResponse.ok) {
            // Assuming the response is an iCalendar file, read it as text
            const icalData = await backendResponse.text()

            res.setHeader('Content-Type', 'text/calendar')
            res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"')
            res.status(200).send(icalData)
        } else {
            const errorText = await backendResponse.text()
            res.status(backendResponse.status).json({ message: errorText })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}
