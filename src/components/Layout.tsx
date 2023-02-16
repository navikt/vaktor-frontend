import Navbar from './NavBar'
import { Header, Footer } from '@navikt/status-components-react'
import Head from 'next/head'
import { useAuth } from '../context/AuthContext'

const today = new Date()
// let icon_url = ""

// today.getMonth() === 11
// ? icon_url = "santa-facicon"
// : icon_url = "images"

const Layout = ({ children }: any) => {
    const { user } = useAuth()

    return (
        <div className="mainContainer">
            <Header imageURL="/vaktor/assets/navblack.png" userID="" userName="" />

            {today.getMonth() === 11 ? (
                <Head>
                    <title>Vaktor - Beredskapsvakt</title>
                    <link rel="shortcut icon" href="/vaktor/santa-favicon/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/vaktor/santa-favicon/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/vaktor/santa-favicon/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/vaktor/santa-favicon/favicon-16x16.png" />
                </Head>
            ) : (
                <Head>
                    <title>Vaktor - Beredskapsvakt</title>
                    <link rel="shortcut icon" href="/vaktor/images/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/vaktor/images/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/vaktor/images/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/vaktor/images/favicon-16x16.png" />
                </Head>
            )}

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
