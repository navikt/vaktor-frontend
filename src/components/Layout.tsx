import Navbar from './NavBar'
import { Footer } from '@navikt/status-components-react'
import Header from './Header'
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
            <Header></Header>
            {/* <Header imageURL="/assets/navblack.png" userID={user.id} userName={user.name} /> */}

            {today.getMonth() === 11 ? (
                <Head>
                    <title>Vaktor - Beredskapsvakt</title>
                    <link rel="shortcut icon" href="/santa-favicon/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/santa-favicon/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/santa-favicon/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/santa-favicon/favicon-16x16.png" />
                </Head>
            ) : (
                <Head>
                    <title>Vaktor - Beredskapsvakt</title>
                    <link rel="shortcut icon" href="/images/favicon.ico" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
                </Head>
            )}

            <div className="content">
                <div className="topHeader"></div>
                <Navbar />

                {children}
            </div>
            <Footer imageURL="/assets/navblack.png" />
        </div>
    )
}

export default Layout
