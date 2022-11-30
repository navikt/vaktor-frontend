import type { NextPage } from "next"
import VaktorTimeline from "../components/VaktorTimeline"
import moment from "moment"
import styled from "styled-components"

const VaktorContainer = styled.div`
    margin-top: 0px;
`

const Home: NextPage = () => {
    moment.locale("nb")
    return (
        <VaktorContainer>
            <VaktorTimeline />
        </VaktorContainer>
    )
}

export default Home
