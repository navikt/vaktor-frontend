import type { NextPage } from 'next'
import { Heading, BodyLong, BodyShort, Label, Alert, Table } from '@navikt/ds-react'
import DocsSidebar, { DocSection } from '../components/DocsSidebar'

const sections: DocSection[] = [
    { id: 'roller', title: 'Roller og tilganger' },
    { id: 'vaktlag', title: 'Vaktlag' },
    { id: 'vaktperioder', title: 'Vaktperioder' },
    { id: 'godkjenning', title: 'Godkjenningsflyt' },
    { id: 'bytte', title: 'Bytte av vakter' },
    { id: 'doble', title: 'Doble vakter' },
    { id: 'lonn', title: 'Lønnsberegning' },
    { id: 'avstemming', title: 'Avstemming' },
    { id: 'sider', title: 'Sideoversikt' },
]

const DocsPage: NextPage = () => {
    return (
        <div style={{ display: 'flex', gap: '2.5rem', width: '100%' }}>
            <DocsSidebar sections={sections} />

            <article style={{ flex: '1 1 0%', minWidth: 0 }}>
                <Heading size="xlarge" level="1" spacing>
                    Dokumentasjon
                </Heading>
                <BodyLong spacing style={{ fontSize: '1.125rem', color: 'var(--ax-text-neutral-subtle)' }}>
                    Alt du trenger å vite om Vaktor — fra roller og vaktperioder til godkjenning og lønnsberegning.
                </BodyLong>

                <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--ax-border-neutral-subtle)' }} />

                {/* === Roller og tilganger === */}
                <section id="roller" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Roller og tilganger
                    </Heading>
                    <BodyLong spacing>
                        Vaktor bruker rollebasert tilgangsstyring. Hvilke sider og funksjoner du ser avhenger av rollene du er tildelt. Du kan ha både
                        globale roller og roller knyttet til et spesifikt vaktlag.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Gruppespesifikke roller
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Rolle</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Vakthaver</Label>
                                </Table.DataCell>
                                <Table.DataCell>
                                    Den som har beredskapsvakt. Kan se og godkjenne egne vaktperioder, og bytte vakter med andre i vaktlaget.
                                </Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Vaktsjef</Label>
                                </Table.DataCell>
                                <Table.DataCell>
                                    Ansvarlig for et vaktlag. Kan godkjenne vakter for sitt lag, opprette vaktperioder og administrere bytter. Kan
                                    ikke godkjenne egne vakter.
                                </Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Leveranseleder</Label>
                                </Table.DataCell>
                                <Table.DataCell>
                                    Leder for leveranseområdet. Kan godkjenne vakter, administrere vaktlag og håndtere perioder.
                                </Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>

                    <Heading size="medium" level="3" spacing>
                        Globale roller
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Rolle</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Personalleder</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kan godkjenne vakter for sine ansatte på tvers av vaktlag.</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>BDM</Label>
                                </Table.DataCell>
                                <Table.DataCell>
                                    Budsjett Delegert Myndighet. Godkjenner kostnader for sine tildelte koststeder innenfor en gitt beløpsgrense.
                                </Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </section>

                {/* === Vaktlag === */}
                <section id="vaktlag" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Vaktlag
                    </Heading>
                    <BodyLong spacing>
                        Et vaktlag er en gruppe personer som deler ansvaret for beredskapsvakt innenfor et fagområde. Hvert vaktlag har sitt eget
                        koststed for lønnsføring.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Sammensetning
                    </Heading>
                    <BodyLong spacing>Et vaktlag består typisk av:</BodyLong>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>
                                <strong>Medlemmer (vakthavere)</strong> — De som roterer på å ha vakt
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Vaktsjef</strong> — Ansvarlig for å administrere vaktplanen
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Leveranseleder</strong> — Overordnet ansvarlig for vaktlaget
                            </BodyLong>
                        </li>
                    </ul>

                    <Heading size="medium" level="3" spacing>
                        Administrasjon
                    </Heading>
                    <BodyLong spacing>
                        Vaktsjef og leveranseleder kan administrere vaktlaget via <strong>Vaktlag</strong>-siden. Her kan man legge til og fjerne
                        medlemmer, endre kontaktinformasjon og oppdatere koststed.
                    </BodyLong>
                </section>

                {/* === Vaktperioder === */}
                <section id="vaktperioder" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Vaktperioder
                    </Heading>
                    <BodyLong spacing>
                        En vaktperiode er et tidsrom der en person har beredskapsvakt. Perioder genereres av vaktsjef og fordeles mellom medlemmene i
                        vaktlaget.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Typer vaktperioder
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Type</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Ordinær vakt</Label>
                                </Table.DataCell>
                                <Table.DataCell>Standard vaktperiode i rotasjonsplanen</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Bytte</Label>
                                </Table.DataCell>
                                <Table.DataCell>Noen overtar hele eller deler av en annens vakt</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Bistand</Label>
                                </Table.DataCell>
                                <Table.DataCell>Ekstra støtte i en periode</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Midlertidig vakt</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kortsiktig vakt utenfor vanlig rotasjon</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>

                    <Heading size="medium" level="3" spacing>
                        Regler
                    </Heading>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Minimum varighet er 7 dager</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Ved bytte må den opprinnelige vakthaveren ha minst 1 time igjen av sin periode</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Vaktperioder ruller typisk over på tirsdager kl. 12:00</BodyLong>
                        </li>
                    </ul>
                </section>

                {/* === Godkjenningsflyt === */}
                <section id="godkjenning" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Godkjenningsflyt
                    </Heading>
                    <BodyLong spacing>
                        Hver vaktperiode går gjennom en godkjenningsprosess med flere steg for å sikre korrekt utbetaling. Statusen vises med farger i
                        oversikten.
                    </BodyLong>

                    <div
                        className="rounded-lg p-6 mb-6"
                        style={{ backgroundColor: 'var(--ax-bg-neutral-moderate)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    >
                        <Heading size="medium" level="3" spacing>
                            Steg 1: Vakthaver godkjenner
                        </Heading>
                        <BodyLong spacing>
                            Du mottar en vaktperiode og bekrefter at du skal ha vakt i denne perioden. Finn dine ventende vakter under{' '}
                            <strong>Dine Vakter</strong>.
                        </BodyLong>

                        <Heading size="medium" level="3" spacing>
                            Steg 2: Leder godkjenner
                        </Heading>
                        <BodyLong spacing>
                            Vaktsjef eller leveranseleder bekrefter vakten og sender den videre til lønnsberegning. Dette gjøres under{' '}
                            <strong>Ledergodkjenning</strong>.
                        </BodyLong>

                        <Heading size="medium" level="3" spacing>
                            Steg 3: Lønnsberegning
                        </Heading>
                        <BodyLong spacing>
                            Vaktor-lønn henter arbeidstiden din fra MinWinTid og beregner utbetalingen automatisk. Arbeidstid og ferie trekkes fra.
                        </BodyLong>

                        <Heading size="medium" level="3" spacing>
                            Steg 4: BDM godkjenner kostnad
                        </Heading>
                        <BodyLong spacing>En budsjettansvarlig (BDM) godkjenner kostnaden mot riktig koststed.</BodyLong>

                        <Heading size="medium" level="3" spacing>
                            Steg 5: Utbetaling
                        </Heading>
                        <BodyLong>Økonomi sender beregningen videre til lønnssystemet for utbetaling.</BodyLong>
                    </div>

                    <Alert variant="info" className="mb-6">
                        Vaktsjef kan ikke godkjenne sine egne vakter. En admin kan tilbakestille en vakt til steg 1 dersom noe er feil. BDM kan bare
                        godkjenne kostnader for koststeder de har myndighet over.
                    </Alert>
                </section>

                {/* === Bytte av vakter === */}
                <section id="bytte" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Bytte av vakter
                    </Heading>
                    <BodyLong spacing>
                        Dersom du ikke kan ha vakt i din tildelte periode kan du bytte med en annen i vaktlaget. Et bytte betyr at noen overtar hele
                        eller deler av din vaktperiode.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Slik gjør du et bytte
                    </Heading>
                    <ol className="list-decimal pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>
                                Gå til <strong>Vaktlagets vakter</strong>
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>Finn vaktperioden du ønsker å bytte</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Opprett et bytte og velg hvem som skal ta over</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Begge parter og leder må godkjenne byttet</BodyLong>
                        </li>
                    </ol>

                    <Heading size="medium" level="3" spacing>
                        Regler for bytte
                    </Heading>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Den opprinnelige vakthaveren må ha minst 1 time igjen av sin periode etter byttet</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Bytteperioden må være minst 7 dager</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Byttet går gjennom samme godkjenningsflyt som en vanlig vakt</BodyLong>
                        </li>
                    </ul>
                </section>

                {/* === Doble vakter === */}
                <section id="doble" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Doble vakter (overlappende)
                    </Heading>
                    <BodyLong spacing>
                        Det kan oppstå situasjoner der en person har vakt for to vaktlag i overlappende perioder. Systemet håndterer dette automatisk.
                    </BodyLong>
                    <BodyLong spacing>
                        Når to vakter overlapper blir begge markert som &quot;doble&quot;. Kostnaden for den overlappende perioden deles 50/50 mellom
                        de to vaktlagene.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Eksempel
                    </Heading>
                    <BodyLong spacing>
                        Du har vakt for Vaktlag A i 7 dager og Vaktlag B i en overlappende periode på 1 dag. Den ene overlappende dagen deles mellom
                        begge vaktlagene, mens de resterende 6 dagene beregnes normalt for Vaktlag A.
                    </BodyLong>
                </section>

                {/* === Lønnsberegning === */}
                <section id="lonn" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Lønnsberegning
                    </Heading>
                    <BodyLong spacing>
                        Lønnen for beredskapsvakt beregnes automatisk basert på den faktiske arbeidstiden din i perioden. Arbeidstid registrert i
                        MinWinTid trekkes fra, sammen med ferie og helligdager.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Tillegg og satser
                    </Heading>
                    <BodyLong spacing>Utbetalingen består av ulike komponenter avhengig av tidspunkt:</BodyLong>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Tillegg</Table.HeaderCell>
                                <Table.HeaderCell>Tidsrom</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Dag</Label>
                                </Table.DataCell>
                                <Table.DataCell>Ordinær dagtid</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Kveld</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kveldstillegg (kl. 20–24)</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Morgen</Label>
                                </Table.DataCell>
                                <Table.DataCell>Morgentillegg (kl. 06–07)</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Helg</Label>
                                </Table.DataCell>
                                <Table.DataCell>Helgetillegg (lørdag–søndag)</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Skift</Label>
                                </Table.DataCell>
                                <Table.DataCell>Skifttillegg</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Utrykning</Label>
                                </Table.DataCell>
                                <Table.DataCell>Tillegg ved utrykning under vakt</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>

                    <Heading size="medium" level="3" spacing>
                        Hva trekkes fra?
                    </Heading>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Arbeidstid registrert i MinWinTid i vaktperioden</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Feriedager</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Helligdager</BodyLong>
                        </li>
                    </ul>
                    <Alert variant="info" className="mb-6">
                        Beredskapsvakt kompenserer for tiden du er tilgjengelig utenfor arbeidstid. Derfor trekkes den tiden du faktisk jobber fra
                        beregningen.
                    </Alert>
                </section>

                {/* === Avstemming === */}
                <section id="avstemming" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Avstemming
                    </Heading>
                    <BodyLong spacing>
                        Avstemming er prosessen der ferdig beregnede vaktperioder verifiseres og sendes til lønnssystemet for utbetaling. Dette
                        håndteres primært av økonomi, men vaktsjef og leveranseleder kan følge med på status for sine vaktlag.
                    </BodyLong>
                    <BodyLong spacing>
                        Under <strong>Ledergodkjenning</strong> kan du se hvilke vakter som er godkjent, under beregning, eller venter på
                        BDM-godkjenning.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Statusbetydninger
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Betydning</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Ikke godkjent</Label>
                                </Table.DataCell>
                                <Table.DataCell>Vakthaver har ikke bekreftet vakten ennå</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Godkjent av vakthaver</Label>
                                </Table.DataCell>
                                <Table.DataCell>Venter på ledergodkjenning</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Under beregning</Label>
                                </Table.DataCell>
                                <Table.DataCell>Lønn beregnes automatisk</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Beregnet</Label>
                                </Table.DataCell>
                                <Table.DataCell>Venter på BDM-godkjenning</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Ferdig</Label>
                                </Table.DataCell>
                                <Table.DataCell>Sendt til lønnssystemet</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </section>

                {/* === Sideoversikt === */}
                <section id="sider" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Sideoversikt
                    </Heading>
                    <BodyLong spacing>Her er en oversikt over sidene i Vaktor og hva du finner hvor.</BodyLong>

                    <Heading size="medium" level="3" spacing>
                        For alle
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Side</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Oversikt</Label>
                                </Table.DataCell>
                                <Table.DataCell>Tidslinje som viser alle vaktperioder for dine vaktlag</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Dine Vakter</Label>
                                </Table.DataCell>
                                <Table.DataCell>Dine egne vaktperioder som trenger handling</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Vaktlagets vakter</Label>
                                </Table.DataCell>
                                <Table.DataCell>Se og administrer vakter for hele vaktlaget</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>

                    <Heading size="medium" level="3" spacing>
                        For vaktsjef og leveranseleder
                    </Heading>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Side</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Vaktperioder</Label>
                                </Table.DataCell>
                                <Table.DataCell>Generer nye vaktperioder for vaktlaget</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Ledergodkjenning</Label>
                                </Table.DataCell>
                                <Table.DataCell>Godkjenn vakter for dine medlemmer</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Vaktlag</Label>
                                </Table.DataCell>
                                <Table.DataCell>Administrer vaktlagets medlemmer og innstillinger</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                </section>
            </article>
        </div>
    )
}

export default DocsPage
