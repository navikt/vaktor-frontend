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
    const [preference, setPreference] = useState<ThemePreference>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vaktor-theme-preference') as ThemePreference | null
            return saved || 'system'
        }
        return 'system'
    })

    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('vaktor-theme-preference') as ThemePreference | null
            if (saved === 'dark' || saved === 'light') {
                return saved
            }
        }
        return getSystemTheme()
    })

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
