import { useEffect, useState } from 'react'
import { BodyShort } from '@navikt/ds-react'

export interface DocSection {
    id: string
    title: string
}

interface DocsSidebarProps {
    sections: DocSection[]
}

const DocsSidebar = ({ sections }: DocsSidebarProps) => {
    const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting)
                if (visible.length > 0) {
                    setActiveId(visible[0].target.id)
                }
            },
            { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
        )

        sections.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [sections])

    const handleClick = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <>
            {/* Desktop sidebar */}
            <div
                role="navigation"
                aria-label="Dokumentasjonsnavigasjon"
                className="hidden lg:block shrink-0"
                style={{
                    width: '14rem',
                    maxHeight: 'calc(100vh - 8rem)',
                    position: 'sticky',
                    top: '6rem',
                    alignSelf: 'flex-start',
                }}
            >
                <ul className="list-none p-0 m-0" style={{ maxHeight: 'calc(100vh - 9rem)', overflowY: 'auto' }}>
                    {sections.map(({ id, title }) => (
                        <li key={id} style={{ marginBottom: '2px' }}>
                            <button
                                onClick={() => handleClick(id)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'background-color 0.15s, color 0.15s',
                                    backgroundColor: activeId === id ? 'var(--ax-bg-info-moderate)' : 'transparent',
                                    color: activeId === id ? 'var(--ax-text-action)' : 'var(--ax-text-default)',
                                    fontWeight: activeId === id ? 600 : 400,
                                }}
                            >
                                {title}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile horizontal scroll */}
            <div
                role="navigation"
                aria-label="Dokumentasjonsnavigasjon"
                className="lg:hidden"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    backgroundColor: 'var(--ax-bg-default)',
                    borderBottom: '1px solid var(--ax-border-neutral-subtle)',
                    overflowX: 'auto',
                }}
            >
                <div style={{ display: 'flex', gap: '4px', padding: '8px 16px', minWidth: 'max-content' }}>
                    {sections.map(({ id, title }) => (
                        <button
                            key={id}
                            onClick={() => handleClick(id)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                cursor: 'pointer',
                                border: 'none',
                                transition: 'background-color 0.15s, color 0.15s',
                                backgroundColor: activeId === id ? 'var(--ax-bg-info-moderate)' : 'transparent',
                                color: activeId === id ? 'var(--ax-text-action)' : 'var(--ax-text-default)',
                                fontWeight: activeId === id ? 600 : 400,
                            }}
                        >
                            <BodyShort size="small">{title}</BodyShort>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default DocsSidebar
