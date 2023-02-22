import { Dispatch, useState } from 'react'
import { Schedules } from '../types/types'
import DeleteButton from './DeleteButton'

const ScheduleChanges = (props: { periods: Schedules[]; setResponse: Dispatch<any> }) => {
    return (
        <>
            {props.periods.map((bakvakter, index) => (
                <div key={index}>
                    <b>{bakvakter.user.name}</b>
                    <br />
                    Fra: {new Date(bakvakter.start_timestamp * 1000).toLocaleString().slice(0, -3)}
                    <br />
                    Til: {new Date(bakvakter.end_timestamp * 1000).toLocaleString().slice(0, -3)}
                    <br />
                    {bakvakter.approve_level === 0 ? (
                        <>
                            <DeleteButton bakvakt={bakvakter.id} setResponse={props.setResponse}></DeleteButton>
                        </>
                    ) : (
                        <div style={{ color: 'red' }}>Kan ikke slettes</div>
                    )}
                </div>
            ))}
        </>
    )
}

export default ScheduleChanges
