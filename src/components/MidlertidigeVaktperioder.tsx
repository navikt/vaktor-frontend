import { Select, DatePicker, useRangeDatepicker } from '@navikt/ds-react'
import { useState } from 'react'

type props = {
    index: Number
    handleChildProps: any
}

function DatePickeroo({ index, handleChildProps }: props) {
    const numWeeksInMs = 6.048e8 * 4 // 4 weeks in ms
    const [now] = useState(() => Date.now())
    // const [startTimestamp, setStartTimestamp] = useState<number>(
    //     // new Date("Jan 01 2023").setHours(12) / 1000
    // )
    // const [endTimestamp, setEndTimestamp] = useState<number>(0)

    const handleDateChange = (from: Number, to: Number) => {
        handleChildProps(index, { from: from, to: to })
    }

    const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
        fromDate: new Date(now), //+ numWeeksInMs),
        toDate: new Date('Feb 01 2027'),
        defaultMonth: new Date(now + numWeeksInMs),
        onRangeChange: (val) => {
            if (val && val.from && val.to) {
                // setStartTimestamp(val.from.setHours(12) / 1000)
                // setEndTimestamp(val.to.setHours(12) / 1000)
                handleDateChange(val.from.setHours(0) / 1000, val.to.setHours(0) / 1000)
            }
        },
    })

    return (
        <>
            <div style={{ margin: 'auto' }}>
                <DatePicker {...datepickerProps}>
                    <DatePicker.Input {...fromInputProps} label="Fra Dato" />

                    <DatePicker.Input {...toInputProps} label="Til Dato" />
                </DatePicker>
            </div>
        </>
    )
}
export default DatePickeroo
