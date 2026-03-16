import type { NextPage } from 'next'
import { Heading, ExpansionCard, ReadMore, BodyLong, BodyShort, VStack, HStack, Tag, Box, List } from '@navikt/ds-react'

const DocsPage: NextPage = () => {
    return (
        <VStack gap="space-8" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <VStack gap="space-4">
                <Heading size="xlarge">Dokumentasjon</Heading>
                <BodyLong>
                    Velkommen til Vaktor-dokumentasjonen. Her finner du informasjon om hvordan systemet fungerer og de
                    viktigste konseptene du trenger å kjenne til.
                </BodyLong>
            </VStack>

            {/* Roller og tilganger */}
            <ExpansionCard aria-label="Roller og tilganger">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Roller og tilganger</ExpansionCard.Title>
                    <ExpansionCard.Description>Hvem gjør hva i Vaktor?</ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-6">
                        <BodyLong>
                            Vaktor bruker rollebasert tilgangsstyring. Hvilke sider og funksjoner du ser avhenger av
                            rollene du er tildelt. Du kan ha både globale roller og roller knyttet til et spesifikt
                            vaktlag.
                        </BodyLong>

                        <Box>
                            <Heading size="xsmall" spacing>
                                Gruppespesifikke roller
                            </Heading>
                            <VStack gap="space-4">
                                <Box>
                                    <HStack gap="space-2" align="center" wrap={false}>
                                        <Tag variant="info" size="small">
                                            Vakthaver
                                        </Tag>
                                    </HStack>
                                    <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                        Den som faktisk har beredskapsvakt. Kan se og godkjenne egne vaktperioder, og
                                        bytte vakter med andre i vaktlaget.
                                    </BodyShort>
                                </Box>
                                <Box>
                                    <HStack gap="space-2" align="center" wrap={false}>
                                        <Tag variant="alt1" size="small">
                                            Vaktsjef
                                        </Tag>
                                    </HStack>
                                    <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                        Ansvarlig for et vaktlag. Kan godkjenne vakter for sitt lag, opprette
                                        vaktperioder og administrere bytter. Kan ikke godkjenne egne vakter.
                                    </BodyShort>
                                </Box>
                                <Box>
                                    <HStack gap="space-2" align="center" wrap={false}>
                                        <Tag variant="alt2" size="small">
                                            Leveranseleder
                                        </Tag>
                                    </HStack>
                                    <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                        Leder for leveranseområdet. Kan godkjenne vakter, administrere vaktlag og
                                        håndtere perioder.
                                    </BodyShort>
                                </Box>
                            </VStack>
                        </Box>

                        <Box>
                            <Heading size="xsmall" spacing>
                                Globale roller
                            </Heading>
                            <VStack gap="space-4">
                                <Box>
                                    <HStack gap="space-2" align="center" wrap={false}>
                                        <Tag variant="warning" size="small">
                                            Personalleder
                                        </Tag>
                                    </HStack>
                                    <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                        Kan godkjenne vakter for sine ansatte på tvers av vaktlag.
                                    </BodyShort>
                                </Box>
                                <Box>
                                    <HStack gap="space-2" align="center" wrap={false}>
                                        <Tag variant="neutral" size="small">
                                            BDM
                                        </Tag>
                                    </HStack>
                                    <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                        Budsjett Delegert Myndighet. Godkjenner kostnader for sine tildelte koststeder
                                        innenfor en gitt beløpsgrense.
                                    </BodyShort>
                                </Box>
                            </VStack>
                        </Box>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Vaktlag */}
            <ExpansionCard aria-label="Vaktlag">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Vaktlag</ExpansionCard.Title>
                    <ExpansionCard.Description>Hva er et vaktlag og hvordan fungerer det?</ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            Et vaktlag er en gruppe personer som deler ansvaret for beredskapsvakt innenfor et
                            fagområde. Hvert vaktlag har sitt eget koststed for lønnsføring.
                        </BodyLong>
                        <BodyLong>Et vaktlag består typisk av:</BodyLong>
                        <List>
                            <List.Item>
                                <strong>Medlemmer (vakthavere)</strong> - De som roterer på å ha vakt
                            </List.Item>
                            <List.Item>
                                <strong>Vaktsjef</strong> - Ansvarlig for å administrere vaktplanen
                            </List.Item>
                            <List.Item>
                                <strong>Leveranseleder</strong> - Overordnet ansvarlig for vaktlaget
                            </List.Item>
                        </List>
                        <ReadMore header="Administrasjon av vaktlag">
                            Vaktsjef og leveranseleder kan administrere vaktlaget via{' '}
                            <strong>Vaktlag</strong>-siden. Her kan man legge til og fjerne medlemmer, endre
                            kontaktinformasjon og oppdatere koststed.
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Vaktperioder */}
            <ExpansionCard aria-label="Vaktperioder">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Vaktperioder</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        Hvordan opprettes og fordeles vaktperioder?
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            En vaktperiode er et tidsrom der en person har beredskapsvakt. Perioder genereres av
                            vaktsjef og fordeles mellom medlemmene i vaktlaget.
                        </BodyLong>

                        <Heading size="xsmall" spacing>
                            Typer vaktperioder
                        </Heading>
                        <VStack gap="space-2">
                            <HStack gap="space-2" align="center">
                                <Tag variant="info" size="small">
                                    Ordinær vakt
                                </Tag>
                                <BodyShort size="small">Standard vaktperiode i rotasjonsplanen</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="alt1" size="small">
                                    Bytte
                                </Tag>
                                <BodyShort size="small">Noen overtar en del av en annens vakt</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="alt2" size="small">
                                    Bistand
                                </Tag>
                                <BodyShort size="small">Ekstra støtte i en periode</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="neutral" size="small">
                                    Midlertidig vakt
                                </Tag>
                                <BodyShort size="small">Kortsiktig vakt utenfor vanlig rotasjon</BodyShort>
                            </HStack>
                        </VStack>

                        <ReadMore header="Regler for vaktperioder">
                            <List>
                                <List.Item>Minimum varighet er 7 dager</List.Item>
                                <List.Item>
                                    Ved bytte må den opprinnelige vakthaveren ha minst 1 time igjen av sin periode
                                </List.Item>
                                <List.Item>
                                    Vaktperioder ruller typisk over på tirsdager kl. 12:00
                                </List.Item>
                            </List>
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Godkjenningsflyt */}
            <ExpansionCard aria-label="Godkjenningsflyt" defaultOpen>
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Godkjenningsflyt</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        Steg-for-steg: fra opprettet vakt til utbetaling
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-6">
                        <BodyLong>
                            Hver vaktperiode går gjennom en godkjenningsprosess med flere steg for å sikre korrekt
                            utbetaling. Statusen vises med farger i oversikten.
                        </BodyLong>

                        <VStack gap="space-4">
                            <Box
                                padding="space-4"
                                borderRadius="8"
                                style={{ borderLeft: '4px solid var(--ax-border-info)' }}
                            >
                                <Heading size="xsmall">Steg 1: Vakthaver godkjenner</Heading>
                                <BodyShort size="small">
                                    Du mottar en vaktperiode og bekrefter at du skal ha vakt i denne perioden. Finn dine
                                    ventende vakter under <strong>Dine Vakter</strong>.
                                </BodyShort>
                            </Box>

                            <Box
                                padding="space-4"
                                borderRadius="8"
                                style={{ borderLeft: '4px solid var(--ax-border-alt-1)' }}
                            >
                                <Heading size="xsmall">Steg 2: Leder godkjenner</Heading>
                                <BodyShort size="small">
                                    Vaktsjef eller leveranseleder bekrefter vakten og sender den videre til
                                    lønnsberegning. Dette gjøres under <strong>Ledergodkjenning</strong>.
                                </BodyShort>
                            </Box>

                            <Box
                                padding="space-4"
                                borderRadius="8"
                                style={{ borderLeft: '4px solid var(--ax-border-warning)' }}
                            >
                                <Heading size="xsmall">Steg 3: Lønnsberegning</Heading>
                                <BodyShort size="small">
                                    Vaktor-lønn henter arbeidstiden din fra MinWinTid og beregner utbetalingen
                                    automatisk. Arbeidstid og ferie trekkes fra.
                                </BodyShort>
                            </Box>

                            <Box
                                padding="space-4"
                                borderRadius="8"
                                style={{ borderLeft: '4px solid var(--ax-border-alt-2)' }}
                            >
                                <Heading size="xsmall">Steg 4: BDM godkjenner kostnad</Heading>
                                <BodyShort size="small">
                                    En budsjettansvarlig (BDM) godkjenner kostnaden mot riktig koststed.
                                </BodyShort>
                            </Box>

                            <Box
                                padding="space-4"
                                borderRadius="8"
                                style={{ borderLeft: '4px solid var(--ax-border-success)' }}
                            >
                                <Heading size="xsmall">Steg 5: Utbetaling</Heading>
                                <BodyShort size="small">
                                    Økonomi sender beregningen videre til lønnssystemet for utbetaling.
                                </BodyShort>
                            </Box>
                        </VStack>

                        <ReadMore header="Viktige regler">
                            <List>
                                <List.Item>Vaktsjef kan ikke godkjenne sine egne vakter</List.Item>
                                <List.Item>
                                    En admin kan tilbakestille en vakt til steg 1 dersom noe er feil
                                </List.Item>
                                <List.Item>
                                    BDM kan bare godkjenne kostnader for koststeder de har myndighet over
                                </List.Item>
                            </List>
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Bytte av vakter */}
            <ExpansionCard aria-label="Bytte av vakter">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Bytte av vakter</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        Hvordan bytte vakt med noen andre i vaktlaget
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            Dersom du ikke kan ha vakt i din tildelte periode kan du bytte med en annen i vaktlaget.
                            Et bytte betyr at noen overtar hele eller deler av din vaktperiode.
                        </BodyLong>

                        <Heading size="xsmall" spacing>
                            Slik gjør du et bytte
                        </Heading>
                        <List as="ol">
                            <List.Item>
                                Gå til <strong>Vaktlagets vakter</strong>
                            </List.Item>
                            <List.Item>Finn vaktperioden du ønsker å bytte</List.Item>
                            <List.Item>Opprett et bytte og velg hvem som skal ta over</List.Item>
                            <List.Item>Begge parter og leder må godkjenne byttet</List.Item>
                        </List>

                        <ReadMore header="Regler for bytte">
                            <List>
                                <List.Item>
                                    Den opprinnelige vakthaveren må ha minst 1 time igjen av sin periode etter byttet
                                </List.Item>
                                <List.Item>Bytteperioden må være minst 7 dager</List.Item>
                                <List.Item>
                                    Byttet går gjennom samme godkjenningsflyt som en vanlig vakt
                                </List.Item>
                            </List>
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Doble vakter */}
            <ExpansionCard aria-label="Doble vakter">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Doble vakter (overlappende)</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        Hva skjer når du har to vakter samtidig?
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            Det kan oppstå situasjoner der en person har vakt for to vaktlag i overlappende
                            perioder. Systemet håndterer dette automatisk.
                        </BodyLong>
                        <BodyLong>
                            Når to vakter overlapper blir begge markert som &quot;doble&quot;. Kostnaden for den
                            overlappende perioden deles 50/50 mellom de to vaktlagene.
                        </BodyLong>
                        <ReadMore header="Eksempel">
                            Du har vakt for Vaktlag A i 7 dager og Vaktlag B i en overlappende periode på 1 dag.
                            Den ene overlappende dagen deles mellom begge vaktlagene, mens de resterende 6 dagene
                            beregnes normalt for Vaktlag A.
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Lønnsberegning */}
            <ExpansionCard aria-label="Lønnsberegning">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Lønnsberegning</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        Hvordan beregnes utbetalingen for beredskapsvakt?
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            Lønnen for beredskapsvakt beregnes automatisk basert på den faktiske arbeidstiden din i
                            perioden. Arbeidstid registrert i MinWinTid trekkes fra, sammen med ferie og helligdager.
                        </BodyLong>

                        <Heading size="xsmall" spacing>
                            Tillegg og satser
                        </Heading>
                        <BodyLong>Utbetalingen består av ulike komponenter avhengig av tidspunkt:</BodyLong>
                        <VStack gap="space-2">
                            <HStack gap="space-2" align="center">
                                <Tag variant="neutral" size="small">
                                    Dag
                                </Tag>
                                <BodyShort size="small">Ordinær dagtid</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="alt1" size="small">
                                    Kveld
                                </Tag>
                                <BodyShort size="small">Kveldstillegg (kl. 20-24)</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="alt2" size="small">
                                    Morgen
                                </Tag>
                                <BodyShort size="small">Morgentillegg (kl. 06-07)</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="info" size="small">
                                    Helg
                                </Tag>
                                <BodyShort size="small">Helgetillegg (lørdag-søndag)</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="warning" size="small">
                                    Skift
                                </Tag>
                                <BodyShort size="small">Skifttillegg</BodyShort>
                            </HStack>
                            <HStack gap="space-2" align="center">
                                <Tag variant="error" size="small">
                                    Utrykning
                                </Tag>
                                <BodyShort size="small">
                                    Tillegg ved utrykning under vakt
                                </BodyShort>
                            </HStack>
                        </VStack>

                        <ReadMore header="Hva trekkes fra?">
                            <List>
                                <List.Item>
                                    Arbeidstid registrert i MinWinTid i vaktperioden
                                </List.Item>
                                <List.Item>Feriedager</List.Item>
                                <List.Item>Helligdager</List.Item>
                            </List>
                            <BodyShort size="small" style={{ marginTop: 'var(--ax-space-2)' }}>
                                Beredskapsvakt kompenserer for tiden du er tilgjengelig utenfor arbeidstid. Derfor
                                trekkes den tiden du faktisk jobber fra beregningen.
                            </BodyShort>
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Avstemming */}
            <ExpansionCard aria-label="Avstemming">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Avstemming</ExpansionCard.Title>
                    <ExpansionCard.Description>
                        For vaktsjef og leveranseleder: oversikt over utbetalingsstatus
                    </ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <BodyLong>
                            Avstemming er prosessen der ferdig beregnede vaktperioder verifiseres og sendes til
                            lønnssystemet for utbetaling. Dette håndteres primært av økonomi, men vaktsjef og
                            leveranseleder kan følge med på status for sine vaktlag.
                        </BodyLong>
                        <BodyLong>
                            Under <strong>Ledergodkjenning</strong> kan du se hvilke vakter som er godkjent, under
                            beregning, eller venter på BDM-godkjenning.
                        </BodyLong>
                        <ReadMore header="Hva betyr de ulike statusene?">
                            <List>
                                <List.Item>
                                    <strong>Ikke godkjent</strong> - Vakthaver har ikke bekreftet vakten ennå
                                </List.Item>
                                <List.Item>
                                    <strong>Godkjent av vakthaver</strong> - Venter på ledergodkjenning
                                </List.Item>
                                <List.Item>
                                    <strong>Under beregning</strong> - Lønn beregnes automatisk
                                </List.Item>
                                <List.Item>
                                    <strong>Beregnet</strong> - Venter på BDM-godkjenning
                                </List.Item>
                                <List.Item>
                                    <strong>Ferdig</strong> - Sendt til lønnssystemet
                                </List.Item>
                            </List>
                        </ReadMore>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>

            {/* Sideoversikt */}
            <ExpansionCard aria-label="Sideoversikt">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Sideoversikt</ExpansionCard.Title>
                    <ExpansionCard.Description>Hva finner du hvor i Vaktor?</ExpansionCard.Description>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <VStack gap="space-4">
                        <Box>
                            <Heading size="xsmall" spacing>
                                For alle
                            </Heading>
                            <List>
                                <List.Item>
                                    <strong>Oversikt</strong> - Tidslinje som viser alle vaktperioder for dine vaktlag
                                </List.Item>
                                <List.Item>
                                    <strong>Dine Vakter</strong> - Dine egne vaktperioder som trenger handling
                                </List.Item>
                                <List.Item>
                                    <strong>Vaktlagets vakter</strong> - Se og administrer vakter for hele vaktlaget
                                </List.Item>
                            </List>
                        </Box>
                        <Box>
                            <Heading size="xsmall" spacing>
                                For vaktsjef og leveranseleder
                            </Heading>
                            <List>
                                <List.Item>
                                    <strong>Vaktperioder</strong> - Generer nye vaktperioder for vaktlaget
                                </List.Item>
                                <List.Item>
                                    <strong>Ledergodkjenning</strong> - Godkjenn vakter for dine medlemmer
                                </List.Item>
                                <List.Item>
                                    <strong>Vaktlag</strong> - Administrer vaktlagets medlemmer og innstillinger
                                </List.Item>
                            </List>
                        </Box>
                    </VStack>
                </ExpansionCard.Content>
            </ExpansionCard>
        </VStack>
    )
}

export default DocsPage
