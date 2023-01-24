import type { NextPage } from "next"
import moment from "moment"
import "moment/locale/nb"
import AvstemmingBakvakter from "../components/AvstemmingBakvakter"
import { GuidePanel } from "@navikt/ds-react"
import { useAuth } from "../context/AuthContext"

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale("nb")

    if (
        ["leveranseleder"].includes(user.role) ||
        user.is_admin === true ||
        user.id === "m131620"
    )
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Avstemming for ØT </p>
                        </GuidePanel>
                    </div>
                    <AvstemmingBakvakter />
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
