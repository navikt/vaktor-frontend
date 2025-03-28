import { useAuth } from '../context/AuthContext'
import { EnvelopeClosedIcon, PhoneIcon } from '@navikt/aksel-icons'
import { BodyShort, Label } from '@navikt/ds-react'
import styled from 'styled-components'

const ContactInformation = styled.div`
    margin: 2rem 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    text-align: center;
    gap: 1rem;

    .externalTextLeft {
        width: 20rem;
        text-align: right;
    }
    .externalTextRight {
        width: 20rem;
        text-align: left;
    }
    .section {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        .icon {
            height: 1.4rem;
            width: 1.4rem;
            margin: 0.1rem 0;
        }
    }
`
const FooterContainer = styled.footer`
    width: 100%;
    margin-top: auto; /*Footer always at bottom (if min.height of container is 100vh)*/
    padding: 0;
    height: 5.5rem;
    background-color: white;
    border-top: 1px solid #eaeaea;

    img {
        width: 63px;
        margin: -1rem 0;
        position: sticky;

        :hover {
            transform: scale(1.05);
        }
    }
    .span {
        display: flex;
        flex-direction: row;
        align-items: center;

        min-height: 80px;
    }

    ul {
        padding: 0;
        list-style: none;

        display: flex;
        flex-direction: column;

        li {
            padding: 0.625rem 0;
        }
    }

    a {
        color: black;
    }

    @media (min-width: 600px) {
        padding: 0 50px;

        flex-direction: row;

        ul {
            flex-direction: row;

            gap: 1.5rem;
        }
    }
`

const Footer = () => {
    const { user } = useAuth()

    return (
        <FooterContainer>
            {user ? (
                <ContactInformation>
                    {' '}
                    <Label> NAV IT Operasjonssenteret </Label>
                    <Label>|</Label>
                    <div className="section">
                        <EnvelopeClosedIcon className="icon" />
                        <BodyShort>
                            <a href="mailto:ops@nav.no">ops@nav.no</a>
                        </BodyShort>
                    </div>
                    <div className="section">
                        <PhoneIcon className="icon" />
                        <BodyShort>{'908 64 954 (døgnbemannet)'}</BodyShort>
                    </div>
                </ContactInformation>
            ) : (
                <ContactInformation>
                    <BodyShort className="externalTextLeft">
                        <a href="https://www.nav.no/no/nav-og-samfunn/om-nav/personvern-i-arbeids-og-velferdsetaten">
                            Personvern og informasjonskapsler
                        </a>
                    </BodyShort>
                    <Label>|</Label>
                    <BodyShort className="externalTextRight">
                        <a href="https://www.nav.no/no/nav-og-samfunn/kontakt-nav/teknisk-brukerstotte/nyttig-a-vite/tilgjengelighet">
                            Tilgjengelighet
                        </a>
                    </BodyShort>
                </ContactInformation>
            )}
        </FooterContainer>
    )
}

export default Footer
