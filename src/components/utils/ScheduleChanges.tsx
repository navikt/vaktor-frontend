import { Dispatch } from 'react'
import { Schedules } from '../../types/types'
import { Loader } from '@navikt/ds-react'
import DeleteButton from './DeleteButton'

const ScheduleChanges = (props: { periods: Schedules[]; setResponse: Dispatch<any>; loading: any; modalView: boolean }) => {
    return (
        <>
            {props.periods.map((bakvakter, index) => (
                <div key={index}>
                    <b>{bakvakter.user.name}</b>
                    <br />
                    Fra:{' '}
                    {new Date(bakvakter.start_timestamp * 1000).toLocaleString('no-NB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    <br />
                    Til:{' '}
                    {new Date(bakvakter.end_timestamp * 1000).toLocaleString('no-NB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    <br />
                    {bakvakter.approve_level === 0 ? (
                        <>
                            {props.loading ? (
                                <div>
                                    <Loader />
                                </div>
                            ) : props.modalView === false ? (
                                <DeleteButton bakvakt={bakvakter.id} setResponse={props.setResponse}></DeleteButton>
                            ) : (
                                ''
                            )}
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
