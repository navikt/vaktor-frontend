import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
                })

            const initialProps = await Document.getInitialProps(ctx)
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            }
        } finally {
            sheet.seal()
        }
    }

    render() {
        return (
            <Html lang="no" data-theme="dark" className="dark">
                <Head />
                <body>
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                                (function() {
                                    try {
                                        const theme = localStorage.getItem('vaktor-theme') || 'dark';
                                        document.documentElement.className = theme;
                                        document.documentElement.setAttribute('data-theme', theme);
                                    } catch (e) {}
                                })();
                            `,
                        }}
                    />
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
