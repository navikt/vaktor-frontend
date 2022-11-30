import Navbar from "./NavBar"
import { useEffect, useState } from "react"
import { User } from "../types/types"
import { Header, Footer } from "@navikt/status-components-react"
import Head from "next/head"

const Layout = ({ children }: any) => {
    const [userData, setUserData] = useState<User>({} as User)
    useEffect(() => {
        Promise.all([fetch("/vaktor/api/get_me")])
            .then(async ([current_user]) => {
                const userjson = await current_user.json()
                return [userjson]
            })
            .then(([userData]) => {
                setUserData(userData)
            })
    }, [])
    return (
        <div className="mainContainer">
            <Header imageURL="/vaktor/assets/navblack.png" />
            <Head>
                <title>Vaktor - Beredskapsvakt</title>
                <link rel="shortcut icon" href="/vaktor/images/favicon.ico" />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/vaktor/images/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/vaktor/images/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/vaktor/images/favicon-16x16.png"
                />
            </Head>
            <div className="content">
                <div className="topHeader"></div>
                <Navbar />

                {children}
            </div>
            <Footer imageURL="/vaktor/assets/navblack.png" />
        </div>
    )
}

export default Layout
