import {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
} from "react"
import { User } from "../types/types"

type authContextType = {
    user: User
}

const authContextDefaultValues: authContextType = {
    user: {} as User,
}

const AuthContext = createContext<authContextType>(authContextDefaultValues)

export const useAuth = () => {
    return useContext(AuthContext)
}

type Props = {
    children: ReactNode
}

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<User>({} as User)

    const fetchUser = async () => {
        return fetch(`/vaktor/api/get_me`)
            .then((res) => res.json())
            .then((userJson) => setUser(userJson))
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const value = { user }

    return (
        <>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </>
    )
}
