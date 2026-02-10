import { Left, Right } from '@navikt/ds-icons'
import { Button, DatePicker, useDatepicker, HStack } from '@navikt/ds-react'
import styled from 'styled-components'
import moment from 'moment'
import { Dispatch, SetStateAction } from 'react'

const NavigateBtn = styled.div`
    display: flex;
    gap: var(--ax-space-8);
    align-items: center;
    justify-content: flex-end;
    background-color: var(--ax-bg-raised);
    padding: var(--ax-space-4);
    border-radius: var(--ax-radius-8);
    box-shadow: var(--ax-shadow-dialog);
    margin-bottom: var(--ax-space-4);
`

const Timeframebtns = styled.div`
    display: inline-flex;
    gap: var(--ax-space-4);
`

export const NavigationButtons = (props: {
    timeStart: number
    timeEnd?: number
    timeUnit: string
    setVisibleTimeStart: Dispatch<SetStateAction<number>>
    setVisibleTimeEnd: Dispatch<SetStateAction<number>>
    setTimeUnit: Dispatch<SetStateAction<string>>
}) => {
    const { datepickerProps, inputProps } = useDatepicker({
        fromDate: new Date('2022-10-01'),
        toDate: new Date('2027-12-31'),
        onDateChange: (date) => {
            if (date) {
                const startOfDay = moment(date).startOf('day').valueOf()
                props.setVisibleTimeStart(startOfDay)

                // Show one week from the selected date
                const oneWeekLater = moment(date).add(7, 'days').endOf('day').valueOf()
                props.setVisibleTimeEnd(oneWeekLater)
            }
        },
    })

    const onPrevClick = () => {
        if (props.timeUnit === 'day') {
            let newVisibleTimeStart = moment(props.timeStart).add(-1, 'day').startOf('day').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(-1, 'day').endOf('day').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'week') {
            let newVisibleTimeStart = moment(props.timeStart).add(-1, 'week').startOf('week').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(-1, 'week').endOf('week').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'month') {
            let newVisibleTimeStart = moment(props.timeStart).add(-1, 'month').startOf('month').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(-1, 'month').endOf('month').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'year') {
            let newVisibleTimeStart = moment(props.timeStart).add(-1, 'year').startOf('year').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(-1, 'year').endOf('year').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
    }

    const onNextClick = () => {
        if (props.timeUnit === 'day') {
            let newVisibleTimeStart = moment(props.timeStart).add(1, 'day').startOf('day').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(1, 'day').endOf('day').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'week') {
            let newVisibleTimeStart = moment(props.timeStart).add(1, 'week').startOf('week').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(1, 'week').endOf('week').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'month') {
            let newVisibleTimeStart = moment(props.timeStart).add(1, 'month').startOf('month').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(1, 'month').endOf('month').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
        if (props.timeUnit === 'year') {
            let newVisibleTimeStart = moment(props.timeStart).add(1, 'year').startOf('year').valueOf()
            let newVisibleTimeEnd = moment(props.timeStart).add(1, 'year').endOf('year').valueOf()
            props.setVisibleTimeStart(newVisibleTimeStart)
            props.setVisibleTimeEnd(newVisibleTimeEnd)
        }
    }

    const handleTimeHeaderChange = (unit: string) => {
        props.setTimeUnit(unit)
        console.log(unit)

        if (unit === 'day') {
            props.setVisibleTimeStart(moment().startOf('day').valueOf())
            props.setVisibleTimeEnd(moment().endOf('day').valueOf())
        }
        if (unit === 'week') {
            props.setVisibleTimeStart(moment().startOf('week').valueOf())
            props.setVisibleTimeEnd(moment().endOf('week').valueOf())
        }
        if (unit === 'month') {
            props.setVisibleTimeStart(moment().startOf('month').valueOf())
            props.setVisibleTimeEnd(moment().endOf('month').valueOf())
        }
        if (unit === 'year') {
            props.setVisibleTimeStart(moment().startOf('year').valueOf())
            props.setVisibleTimeEnd(moment().endOf('year').valueOf())
        }
    }
    return (
        <NavigateBtn>
            <DatePicker {...datepickerProps} strategy="fixed">
                <HStack gap="space-2">
                    <DatePicker.Input {...inputProps} label="Fra" size="small" />
                    <DatePicker.Input {...inputProps} label="Til" size="small" />
                </HStack>
            </DatePicker>

            <Timeframebtns>
                <Button size="small" variant="secondary" onClick={() => handleTimeHeaderChange('week')}>
                    Uke
                </Button>
                <Button size="small" variant="secondary" onClick={() => handleTimeHeaderChange('month')}>
                    Måned
                </Button>
            </Timeframebtns>

            <HStack gap="space-2">
                <Button size="small" variant="secondary" onClick={() => onPrevClick()} icon={<Left />} />
                <Button size="small" variant="secondary" onClick={() => onNextClick()} icon={<Right />} />
            </HStack>
        </NavigateBtn>
    )
}
