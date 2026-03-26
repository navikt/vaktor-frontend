import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light'
type ThemePreference = 'dark' | 'light' | 'system'

interface ThemeContextType {
    theme: Theme
    preference: ThemePreference
    setThemePreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [preference, setPreference] = useState<ThemePreference>('system')
    const [theme, setTheme] = useState<Theme>('dark')

    useEffect(() => {
        const saved = localStorage.getItem('vaktor-theme-preference') as ThemePreference | null
        const resolvedPreference = saved || 'system'
        const resolvedTheme = resolvedPreference === 'dark' || resolvedPreference === 'light' ? resolvedPreference : getSystemTheme()
        // Batch both updates together to avoid double render
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreference(resolvedPreference)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(resolvedTheme)
    }, [])

    useEffect(() => {
        // Oppdater DOM når theme endres
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        // Når preference er 'system', lytt til system preference changes
        if (preference !== 'system') return

        const updateSystemTheme = () => setTheme(getSystemTheme())
        updateSystemTheme()

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', updateSystemTheme)
        return () => mediaQuery.removeEventListener('change', updateSystemTheme)
    }, [preference])

    const setThemePreference = (newPreference: ThemePreference) => {
        setPreference(newPreference)
        localStorage.setItem('vaktor-theme-preference', newPreference)

        // Oppdater theme umiddelbart hvis eksplisitt valg
        if (newPreference === 'dark' || newPreference === 'light') {
            setTheme(newPreference)
        } else {
            setTheme(getSystemTheme())
        }
    }

    return <ThemeContext.Provider value={{ theme, preference, setThemePreference }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
