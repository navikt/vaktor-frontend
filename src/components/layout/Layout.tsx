import Navbar from './NavBar'
import { Page, VStack } from '@navikt/ds-react'
import Header from './Header'
import Head from 'next/head'
import { useAuth } from '../../context/AuthContext'
import Footer from './Footer'

const today = new Date()

const Layout = ({ children }: any) => {
    const { user } = useAuth()

    return (
        <>
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
            <VStack gap="space-0" style={{ minHeight: '100vh', backgroundColor: 'var(--ax-bg-default)' }}>
                <Page style={{ flex: 1 }}>
                    <Header />
                    <Page.Block as="main" width="2xl" gutters>
                        <VStack gap="space-8">
                            <Navbar />
                            {children}
                        </VStack>
                    </Page.Block>
                </Page>
                <Footer />
            </VStack>
        </>
    )
}

export default Layout
