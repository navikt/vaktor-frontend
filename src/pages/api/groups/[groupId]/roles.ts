import { NextApiRequest, NextApiResponse } from 'next'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// NAVident format (letter followed by 6 digits) or simple alphanumeric
const USER_ID_REGEX = /^[A-Za-z][0-9]{6}$/
// Role titles are predefined strings
const VALID_ROLE_TITLES = ['vakthaver', 'vaktsjef', 'leveranseleder', 'admin', 'okonomi', 'bdm', 'personalleder']

function isValidGroupId(id: unknown): id is string {
    return typeof id === 'string' && UUID_REGEX.test(id)
}

function isValidUserId(id: unknown): id is string {
    return typeof id === 'string' && USER_ID_REGEX.test(id)
}

function isValidRoleTitle(title: unknown): title is string {
    return typeof title === 'string' && VALID_ROLE_TITLES.includes(title.toLowerCase())
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { groupId, user_id, role_title } = req.query

    // Validate groupId to prevent SSRF
    if (!isValidGroupId(groupId)) {
        return res.status(400).json({ detail: 'Invalid group ID format' })
    }

    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    try {
        let path = `${process.env.BACKEND_URL}/api/v1/groups/${encodeURIComponent(groupId)}/roles`

        if (req.method === 'GET') {
            const backendResponse = await fetch(path, {
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else if (req.method === 'POST') {
            if (!user_id || !role_title) {
                return res.status(400).json({ detail: 'user_id and role_title are required' })
            }

            // Validate user_id and role_title to prevent SSRF
            if (!isValidUserId(user_id)) {
                return res.status(400).json({ detail: 'Invalid user ID format' })
            }
            if (!isValidRoleTitle(role_title)) {
                return res.status(400).json({ detail: 'Invalid role title' })
            }

            path += `?user_id=${encodeURIComponent(user_id)}&role_title=${encodeURIComponent(role_title)}`

            const backendResponse = await fetch(path, {
                method: 'POST',
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else if (req.method === 'DELETE') {
            if (!user_id || !role_title) {
                return res.status(400).json({ detail: 'user_id and role_title are required' })
            }

            // Validate user_id and role_title to prevent SSRF
            if (!isValidUserId(user_id)) {
                return res.status(400).json({ detail: 'Invalid user ID format' })
            }
            if (!isValidRoleTitle(role_title)) {
                return res.status(400).json({ detail: 'Invalid role title' })
            }

            path += `?user_id=${encodeURIComponent(user_id)}&role_title=${encodeURIComponent(role_title)}`

            const backendResponse = await fetch(path, {
                method: 'DELETE',
                headers: { Authorization: authorizationHeader },
            })

            const body = await backendResponse.json()

            if (backendResponse.ok) {
                res.status(200).json(body)
            } else {
                res.status(backendResponse.status).json(body)
            }
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
            res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ detail: 'Internal Server Error' })
    }
}
