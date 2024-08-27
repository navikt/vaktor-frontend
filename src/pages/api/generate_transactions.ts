import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const schedule_ids = req.body
    const file_type = req.query.file_type
    let path = `${process.env.BACKEND_URL}/api/v1/okonomi/transactions`

    if (file_type === '2') {
        path = `${process.env.BACKEND_URL}/api/v1/okonomi/transactions_diff`
    }

    try {
        // Send a POST request to the backend API
        const backendResponse = await fetch(path, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: schedule_ids, // Convert the schedule_ids to a JSON string
        })

        // Check if the backend response is ok
        if (backendResponse.ok) {
            // Determine the content type of the response
            const contentType = backendResponse.headers.get('content-type')
            const contentDisposition = backendResponse.headers.get('content-disposition')

            if (contentType?.includes('application/json')) {
                // If the response is JSON, parse and return it
                const data = await backendResponse.json()
                res.status(200).json(data)
            } else if (contentType?.includes('text') || contentType?.includes('application/octet-stream')) {
                // If the response is a file, extract the filename from the Content-Disposition header
                let filename = 'downloaded_file.txt' // Default filename if none is found
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="(.+?)"/)
                    if (match && match[1]) {
                        filename = match[1]
                    }
                }

                // Read the file content as a buffer
                const fileBuffer = await backendResponse.arrayBuffer()
                const fileData = Buffer.from(fileBuffer)

                // Set the appropriate headers to indicate a file download
                res.setHeader('Content-Type', contentType)
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
                res.send(fileData)
            } else {
                // If content type is not recognized, return an error
                res.status(500).json({ error: 'Unexpected content type from backend.' })
            }
        } else {
            // If the backend response is not ok, return the error message
            const errorMessage = await backendResponse.json()
            res.status(backendResponse.status).json(errorMessage)
        }
    } catch (error) {
        console.error('Error:', error)
        res.status(500).send('Internal Server Error')
    }
}
