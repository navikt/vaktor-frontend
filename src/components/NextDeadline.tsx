import React, { useEffect, useState } from 'react'

const NextDeadlineBox = () => {
    const [nesteFrist, setNesteFrist] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/get_timetable')
            .then((res) => res.json())
            .then((data) => {
                setNesteFrist(data?.nesteFrist ?? null)
            })
            .catch(() => setNesteFrist(null))
    }, [])

    return (
        <div
            style={{
                border: '1px solid #f96c6c',
                borderRadius: '4px',
                padding: '8px',
                minWidth: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
            }}
        >
            Neste frist for godkjenning:{' '}
            <b>
                {nesteFrist
                    ? new Date(nesteFrist).toLocaleString('no-NB', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : 'Laster...'}
            </b>
        </div>
    )
}

export default NextDeadlineBox
