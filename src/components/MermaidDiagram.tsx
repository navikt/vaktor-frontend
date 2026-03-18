import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const MermaidDiagram = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null)
    const { theme } = useTheme()
    const id = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

    useEffect(() => {
        if (!ref.current) return
        let cancelled = false

        import('mermaid').then((m) => {
            if (cancelled) return
            m.default.initialize({
                startOnLoad: false,
                theme: theme === 'dark' ? 'dark' : 'default',
                fontFamily: 'inherit',
            })
            m.default.render(id.current, chart).then(({ svg }) => {
                if (!cancelled && ref.current) {
                    ref.current.innerHTML = svg
                }
            })
        })

        return () => {
            cancelled = true
        }
    }, [chart, theme])

    return <div ref={ref} style={{ overflowX: 'auto', margin: '1.5rem 0' }} />
}

export default MermaidDiagram
