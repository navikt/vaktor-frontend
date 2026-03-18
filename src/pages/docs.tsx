import type { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Heading, BodyLong, BodyShort, Label, Alert, Table } from '@navikt/ds-react'
import DocsSidebar, { DocSection } from '../components/DocsSidebar'

const MermaidDiagram = dynamic(() => import('../components/MermaidDiagram'), { ssr: false })

const SEQUENCE_DIAGRAM = `
sequenceDiagram
  actor Vakthaver
  actor Vaktsjef
  actor BDM
  participant Plan as Vaktor Plan
  participant Lonn as Vaktor Lonn
  participant MinWinTid
  participant Fullmaktregister
  participant Oekonomi as Oekonomi (OT)
  Plan-->>Plan: Endt vaktperiode
  Plan->>Vakthaver: Ber om godkjenning av periode
  Vakthaver-->>Plan: Godkjenner vaktperiode
  Plan->>Vaktsjef: Ber om godkjenning av vaktperiode
  Vaktsjef-->>Plan: Godkjenner vaktperiode
  Plan->>Lonn: Godkjent vaktperiode
  Lonn-->>Plan: Periode mottatt
  loop Every hour
    Lonn->>MinWinTid: Ber om arbeidstid i vaktperiode
    MinWinTid-->>Lonn: Arbeidstid
    Lonn-->>Lonn: Sjekk om arbeidstid er godkjent av personalleder
    Lonn-->>Lonn: Sjekk at det ikke er ferie i vaktperioden
    Lonn-->>Lonn: Beregner utbetaling av kronetillegg og overtidstillegg
    Lonn->>Plan: Utbetaling for vaktperiode
  end
  Plan->>Fullmaktregister: Henter BDM for vakthaver
  Fullmaktregister-->>Plan: Liste over BDMer for vakthaver
  Plan->>BDM: Ber om godkjenning av utbetalinger
  BDM-->>Plan: Godkjenner vakthaver sin utbetalinger
  Plan-->>Oekonomi: Sender godkjente lonnstransaksjoner
`

const DATAFLOW_DIAGRAM = `
flowchart LR
  subgraph NAIS
    vp(Vaktor Plan)
    vl(Vaktor Lonn)
    pgvp[(Vaktor Plan 10ar lagring)]
    pgvl[(Vaktor Lonn DB)]
    vp <-- BMD ident --> Fullmaktsregister
  end
  vp -- vaktplan ident vaktplan --> vl
  vl -- beregning sum timer --> vp
  vl <-- Ident vaktplan slettes etter beregning --> pgvl
  vp -- Vaktplan ident beregning sum timer --> pgvp
  subgraph Azure
    vp -- Innlogging SSO --> AzureAD
  end
  subgraph on-prem
    vp -- beregning artskoder sum timer per ident --> OT
    vl <-- timelister satser lonn --> Datavarehus
  end
`

const sections: DocSection[] = [
    { id: 'om-vaktor', title: 'Om Vaktor' },
    { id: 'dataflyt', title: 'Dataflyt' },
    { id: 'roller', title: 'Roller og tilganger' },
    { id: 'vaktlag', title: 'Vaktlag' },
    { id: 'vaktperioder', title: 'Vaktperioder' },
    { id: 'godkjenning', title: 'Godkjenningsflyt' },
    { id: 'bytte', title: 'Bytte av vakter' },
    { id: 'doble', title: 'Doble vakter' },
    { id: 'lonn', title: 'Lønnsberegning' },
    { id: 'artskoder', title: 'Artskoder' },
    { id: 'rammer', title: 'Rammer' },
    { id: 'rutiner', title: 'Rutiner' },
    { id: 'sporbarhet', title: 'Sporbarhet' },
    { id: 'lagring', title: 'Lagring' },
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

                {/* === Om Vaktor === */}
                <section id="om-vaktor" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Om Vaktor
                    </Heading>
                    <BodyLong spacing>
                        Vaktor er et system for planlegging og utbetaling av beredskapsvakt i NAV. Systemet er delt i to tjenester:
                    </BodyLong>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>
                                <strong>Vaktor Plan</strong> — Har oversikt over alle vakter og godkjenning av vaktene.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Vaktor Lønn</strong> — Tar seg av beregningen av utbetalingen for en vaktperiode. Utbetalingen regnes ut
                                basert på perioden du har gått vakt, minus arbeidstid.
                            </BodyLong>
                        </li>
                    </ul>
                    <BodyLong spacing>
                        Kildekoden ligger på GitHub under Navikt-organisasjonen: <strong>vaktor-lonn</strong>, <strong>vaktor-frontend</strong> og{' '}
                        <strong>vaktor-plan</strong>.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Datakilder
                    </Heading>
                    <BodyLong spacing>Data som brukes i utregning av beredskapsvakt hentes fra datavarehuset:</BodyLong>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>
                                <strong>Kronesatser</strong> — kilde: Unit4
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Årslønn</strong> — kilde: Unit4
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Arbeidstid</strong> — kilde: MinWinTid
                            </BodyLong>
                        </li>
                    </ul>
                    <Alert variant="info" className="mb-6">
                        Datavarehuset oppdateres tre ganger i døgnet (kl. 01, kl. 12:30, kl. 17). Det tar som regel en time før dataen er tilgjengelig
                        for Vaktor.
                    </Alert>

                    <Heading size="medium" level="3" spacing>
                        Data vi lagrer
                    </Heading>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Navn, e-post og NAV-ident</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Vaktperiode og beregnet lønn</BodyLong>
                        </li>
                    </ul>
                    <BodyShort style={{ color: 'var(--ax-text-neutral-subtle)' }}>
                        Ta kontakt med HR-avdelingen for innsyn i hvilke personopplysninger vi har lagret.
                    </BodyShort>
                </section>

                {/* === Dataflyt === */}
                <section id="dataflyt" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Dataflyt
                    </Heading>
                    <BodyLong spacing>
                        Diagrammene nedenfor viser flyten gjennom Vaktor — fra vakthaver godkjenner, til lønn er overført til ØT — samt den
                        overordnede arkitekturen og dataflyt mellom tjenestene.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Sekvensdiagram
                    </Heading>
                    <MermaidDiagram chart={SEQUENCE_DIAGRAM} />

                    <Heading size="medium" level="3" spacing>
                        Arkitektur og dataflyt
                    </Heading>
                    <MermaidDiagram chart={DATAFLOW_DIAGRAM} />

                    <Heading size="medium" level="3" spacing>
                        Overordnet flyt (steg for steg)
                    </Heading>
                    <ol className="list-decimal pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Vakthaver bekrefter vaktperioden etter gjennomført vakt</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Vaktsjef godkjenner vaktperioden</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Plan sender Lønn vaktperioden</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Lønn lagrer vaktperioden for videre behandling</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Lønn venter på godkjente timelister fra datavarehus (MinWinTid)</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Lønn beregner utbetaling basert på timeliste og vaktperiode</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Plan får tilbake beregning</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Plan henter BDM fra Fullmaktsregisteret</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Plan informerer BDM og venter på godkjenning</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Godkjent utbetaling sendes til ØT via transaksjonsfil (pr28-format) over SFTP</BodyLong>
                        </li>
                    </ol>
                </section>

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
                                <Table.HeaderCell>Hjemmel</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Natt/morgen</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kl. 00–06 og 20–00</Table.DataCell>
                                <Table.DataCell>§15.5 HTA</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Dag</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kl. 06–20</Table.DataCell>
                                <Table.DataCell>§15.5 HTA</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Helg</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kl. 00–00 lørdag/søndag</Table.DataCell>
                                <Table.DataCell>§15.4 HTA</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Skift</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kl. 06–07 og 17–20</Table.DataCell>
                                <Table.DataCell>§15.3 HTA</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>Utrykning</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kronetillegg for utrykning under vakt</Table.DataCell>
                                <Table.DataCell>§9 Beredskapsvakt</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>

                    <Heading size="medium" level="3" spacing>
                        Beregningsprinsipp
                    </Heading>
                    <BodyLong spacing>
                        For kronetilleggene legges alle minutter per artskode sammen for hele perioden, rundes av til nærmeste hele time, og
                        multipliseres med gjeldende kronetillegg. Tilleggene i §15.3 og §15.4 utbetales i forholdet 1/5 (ref. §17.1 HTA).
                    </BodyLong>
                    <BodyLong spacing>
                        For overtidstillegg beregnes timesats som <em>årslønn / 1850 timer</em> tillagt prosentsats (50 % eller 100 %), og
                        multipliseres med vakttid i forholdet 1/5.
                    </BodyLong>
                    <BodyLong spacing>For kronetillegg ved utrykning benyttes forholdet 1/1.</BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Hva trekkes fra?
                    </Heading>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>Arbeidstid registrert i MinWinTid i vaktperioden</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Feriedager (kan ikke ha vakt og ferie samtidig, ref. §6 Beredskapsvakt)</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Bevegelige helligdager som ikke faller på lørdag/søndag gir ikke helgetillegg (ref. §16.1 HTA)</BodyLong>
                        </li>
                    </ul>
                    <Alert variant="info" className="mb-6">
                        Beredskapsvakt kompenserer for tiden du er tilgjengelig utenfor arbeidstid. Maks vaktperiode per døgn er antall timer i døgnet
                        minus ordinær arbeidstid (ref. §5 Beredskapsvakt). Tid man faktisk jobber trekkes fra i perioden kl. 06–20.
                    </Alert>
                </section>

                {/* === Artskoder === */}
                <section id="artskoder" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Artskoder
                    </Heading>
                    <BodyLong spacing>
                        Kronetilleggene fordeles på seks artskoder som definerer hva slags kostnad det er, og som vises på lønnsslippen.
                    </BodyLong>
                    <Table className="mb-6">
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Artskode</Table.HeaderCell>
                                <Table.HeaderCell>Navn</Table.HeaderCell>
                                <Table.HeaderCell>Tidsrom</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2680</Label>
                                </Table.DataCell>
                                <Table.DataCell>Morgen</Table.DataCell>
                                <Table.DataCell>Kl. 00–06</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2681</Label>
                                </Table.DataCell>
                                <Table.DataCell>Kveld</Table.DataCell>
                                <Table.DataCell>Kl. 20–00</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2682</Label>
                                </Table.DataCell>
                                <Table.DataCell>Dag</Table.DataCell>
                                <Table.DataCell>Kl. 06–20</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2683</Label>
                                </Table.DataCell>
                                <Table.DataCell>Helg</Table.DataCell>
                                <Table.DataCell>Kl. 00–00 (helg). Morgen, kveld og dag i helg samles her.</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2684</Label>
                                </Table.DataCell>
                                <Table.DataCell>Skifttillegg</Table.DataCell>
                                <Table.DataCell>Kl. 06–07 og 17–20</Table.DataCell>
                            </Table.Row>
                            <Table.Row>
                                <Table.DataCell>
                                    <Label>2685</Label>
                                </Table.DataCell>
                                <Table.DataCell>Utrykning</Table.DataCell>
                                <Table.DataCell>Kronetillegg for utrykning under vakt</Table.DataCell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
                    <Alert variant="info" className="mb-6">
                        Overtidstillegg fordeles på de samme artskodene. For utrykninger betaler MinWinTid overtidstillegget (prosenttillegget), mens
                        Vaktor tar seg av kronetillegget (artskode 2685).
                    </Alert>
                </section>

                {/* === Rammer === */}
                <section id="rammer" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Rammer
                    </Heading>
                    <BodyLong spacing>Vaktor har satt følgende rammer for ansvar og beregning:</BodyLong>
                    <ul className="list-disc pl-6 space-y-3 mb-6">
                        <li>
                            <BodyLong>
                                Siden MinWinTid rapporterer på minutter, og vakttillegg regnes i timer, legger Vaktor Lønn sammen alle minutter per
                                individuelle vakttillegg i en periode og gjør om til timer.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                Vaktor Lønn vil ikke regne vakttillegg for tid man ikke jobber i kjernetiden — beredskapsvakt er til for å dekke
                                uforutsette hendelser utenom arbeidstid (§1 Beredskapsvakt).
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>Maks vaktperiode er antall timer i døgnet minus ordinær arbeidstid for vakthaver (§5 Beredskapsvakt).</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Arbeider man mer enn ordinær arbeidstid vil man ikke få vakttillegg for det overskytende.</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Vaktor Lønn vil ikke følge med på om man glemmer å føre timer.</BodyLong>
                        </li>
                        <li>
                            <BodyLong>Man kan ikke ha vakt samtidig som man har ferie (§6 Beredskapsvakt).</BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                Tilleggene i §15.3 og §15.4 utbetales i forholdet 1/5 (§17.1 HTA). Kronetillegg ved utrykning utbetales i forholdet
                                1/1.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                For bevegelige helligdager som ikke faller på lørdag eller søndag utbetales ikke helgetillegg (§16.1 HTA).
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                Ved overtid på grunn av utrykning betaler MinWinTid prosentovertidstillegget, mens Vaktor Lønn regner ut
                                kronetillegget. Man vil få vakttillegg under utrykning.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                For godkjente dager uten stempling legger Lønn til grunn at vakthaver har arbeidet ordinær arbeidstid, med stempling
                                fra kl. 08:00 like lenge som ordinær arbeidstid for den dagen.
                            </BodyLong>
                        </li>
                    </ul>
                </section>

                {/* === Rutiner === */}
                <section id="rutiner" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Rutiner
                    </Heading>

                    <Heading size="medium" level="3" spacing>
                        Overføring og utbetaling
                    </Heading>
                    <BodyLong spacing>
                        Vaktor støtter utbetaling to ganger i måneden: ordinær lønnskjøring (12. i måneden) og ekstra lønnskjøring (siste dag i
                        måneden). Et par dager før lønnskjøringen genererer Vaktor en transaksjonsfil i pr28-format med godkjente vaktperioder. Filen
                        sendes til ØT via SFTP.
                    </BodyLong>
                    <BodyLong spacing>
                        Alle perioder har en status. Når en periode er utbetalt, får den statusen <strong>«Overført til lønn»</strong>. I tillegg
                        audit-logges det hvilken fil som ble overført til ØT, og dette er tilgjengelig for ØT i et eget GUI.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Etterbetaling etter lønnsregulering/satsendring
                    </Heading>
                    <BodyLong spacing>
                        Ved endring av lønn eller satser kan en administrator starte en ny beregning av alle vaktperioder i en gitt periode. Det
                        beregnes automatisk en differanse mellom hva som er utbetalt og hva som eventuelt mangler. Etterbetalingen loggføres med
                        begrunnelse.
                    </BodyLong>
                    <BodyLong spacing>
                        Samme funksjonalitet benyttes for etterbetaling ved tariffoppgjør og alle reguleringer med tilbakevirkende kraft. Rutine for
                        varsling og iverksetting utarbeides og eies av ØT.
                    </BodyLong>

                    <Heading size="medium" level="3" spacing>
                        Ekstra kjøring ved manglende godkjenning
                    </Heading>
                    <BodyLong spacing>
                        Hvis vakthaver eller vaktsjef har glemt å godkjenne, eller vakthaver har ført feil i MinWinTid, tilbyr Vaktor en ekstra
                        kjøring på slutten av måneden. Fristen er som regel siste dag i måneden minus fire arbeidsdager.
                    </BodyLong>
                </section>

                {/* === Sporbarhet === */}
                <section id="sporbarhet" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Sporbarhet
                    </Heading>
                    <BodyLong spacing>For mest mulig sporbarhet opererer Vaktor med tre forskjellige ID-er:</BodyLong>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>
                            <BodyLong>
                                <strong>Vaktperiode-ID</strong> — Unik ID for hver vaktperiode.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Beregnings-ID</strong> — Unik ID for hver beregning. En vaktperiode kan ha flere beregninger, men én beregning
                                kan kun tilhøre én vaktperiode.
                            </BodyLong>
                        </li>
                        <li>
                            <BodyLong>
                                <strong>Commit SHA</strong> — Unik ID for den spesifikke versjonen av Vaktor Lønn som utførte beregningen.
                            </BodyLong>
                        </li>
                    </ul>
                    <BodyLong spacing>
                        Med disse tre ID-ene kan en kjøring gjenskapes så lenge de samme dataene fra datavarehus er tilgjengelige.
                    </BodyLong>
                </section>

                {/* === Lagring === */}
                <section id="lagring" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
                    <Heading size="large" level="2" spacing>
                        Lagring
                    </Heading>
                    <BodyLong spacing>
                        For etterlevelse av økonomireglementet lagres alle data som benyttes i beregningen av lønnstransaksjonen, i tillegg til selve
                        lønnstransaksjonen, i <strong>ti år</strong> (ref. ØR kap. 4.4.10.2 om regnskapsmateriale).
                    </BodyLong>
                    <BodyLong spacing>Krav fra arkiv og personvern gjelder etter de 10 årene ØR krever.</BodyLong>
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
