import { NextApiRequest, NextApiResponse } from 'next'

const getQueryParam = (value: string | string[] | undefined): string | undefined => {
    if (!value) return undefined
    return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let authorizationHeader = req.headers?.authorization ?? 'No Authorization header'

    if (process.env.FAKE_TOKEN) {
        authorizationHeader = process.env.FAKE_TOKEN
    }

    const startTimestamp = getQueryParam(req.query.start_timestamp)
    const endTimestamp = getQueryParam(req.query.end_timestamp)
    const selectedMonthStart = getQueryParam(req.query.selected_month_start)
    const selectedMonthEnd = getQueryParam(req.query.selected_month_end)
    const includeHistoricalOpen = getQueryParam(req.query.include_historical_open)
    const historicalStatuses = getQueryParam(req.query.historical_statuses)
    const lookbackMonths = getQueryParam(req.query.lookback_months)

    if (!startTimestamp || !endTimestamp) {
        return res.status(400).json({ message: 'Missing required parameter start_timestamp and/or end_timestamp' })
    }

    const query = new URLSearchParams({
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp,
    })

    if (selectedMonthStart) query.set('selected_month_start', selectedMonthStart)
    if (selectedMonthEnd) query.set('selected_month_end', selectedMonthEnd)
    if (includeHistoricalOpen) query.set('include_historical_open', includeHistoricalOpen)
    if (historicalStatuses) query.set('historical_statuses', historicalStatuses)
    if (lookbackMonths) query.set('lookback_months', lookbackMonths)

    const path = `${process.env.BACKEND_URL}/api/v1/leaders/users/schedules_with_limit?${query.toString()}`

    const backendResponse = await fetch(path, {
        headers: { Authorization: authorizationHeader },
    })

    const body = await backendResponse.json()
    return res.status(backendResponse.status).json(body)
}
