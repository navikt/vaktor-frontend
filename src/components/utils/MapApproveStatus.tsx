// ApproveStatus.tsx

import { Table } from '@navikt/ds-react'
import React from 'react'
import { Error_messages } from '../../types/types'
import { useTheme } from '../../context/ThemeContext'

interface ApproveStatusProps {
    status: number
    error: any
}

const MapApproveStatus: React.FC<ApproveStatusProps> = ({ status, error }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    let statusText = ''
    let bgColorClass = ''
    let textColorClass = ''
    let errorText = ''

    switch (status) {
        case 1:
            statusText = 'Godkjent av ansatt'
            bgColorClass = isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100'
            textColorClass = isDarkMode ? 'text-blue-100' : 'text-blue-900'
            break
        case 2:
            statusText = 'Venter på utregning '
            bgColorClass = isDarkMode ? 'bg-green-900/40' : 'bg-green-100'
            textColorClass = isDarkMode ? 'text-green-100' : 'text-green-900'
            errorText = error.map((messages: Error_messages, idx: number) => (
                <div key={idx} className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {messages.error}
                </div>
            ))
            break
        case 3:
            statusText = 'Godkjent av vaktsjef'
            bgColorClass = isDarkMode ? 'bg-green-900/40' : 'bg-green-100'
            textColorClass = isDarkMode ? 'text-green-100' : 'text-green-900'
            break
        case 4:
            statusText = 'Godkjent av BDM'
            bgColorClass = isDarkMode ? 'bg-orange-900/40' : 'bg-orange-100'
            textColorClass = isDarkMode ? 'text-orange-100' : 'text-orange-900'
            break
        case 5:
            statusText = 'Overført til lønn'
            bgColorClass = isDarkMode ? 'bg-orange-900/40' : 'bg-orange-100'
            textColorClass = isDarkMode ? 'text-orange-100' : 'text-orange-900'
            break
        case 6:
            statusText = 'Venter på utregning av diff'
            bgColorClass = isDarkMode ? 'bg-green-900/40' : 'bg-green-100'
            textColorClass = isDarkMode ? 'text-green-100' : 'text-green-900'
            errorText = error.map((messages: Error_messages, idx: number) => (
                <div key={idx} className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {messages.error}
                </div>
            ))
            break
        case 7:
            statusText = 'Utregning fullført med diff'
            bgColorClass = isDarkMode ? 'bg-green-900/40' : 'bg-green-100'
            textColorClass = isDarkMode ? 'text-green-100' : 'text-green-900'
            break
        case 8:
            statusText = 'Overført til lønn etter rekjøring'
            bgColorClass = isDarkMode ? 'bg-orange-900/40' : 'bg-orange-100'
            textColorClass = isDarkMode ? 'text-orange-100' : 'text-orange-900'
            break
        default:
            statusText = 'Trenger godkjenning'
            bgColorClass = isDarkMode ? 'bg-yellow-900/40' : 'bg-yellow-50'
            textColorClass = isDarkMode ? 'text-yellow-100' : 'text-yellow-900'
            break
    }

    return (
        <div
            className={`${bgColorClass} ${textColorClass} px-3 py-2 rounded min-h-[40px] flex flex-col justify-center border-2 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}
        >
            <div className="text-xs font-semibold mb-0.5 uppercase opacity-80">Status</div>
            <div className="font-bold text-sm">{statusText}</div>
            {errorText}
        </div>
    )
}

export default MapApproveStatus
