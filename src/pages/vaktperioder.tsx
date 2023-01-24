import type { NextPage } from "next"
import moment from "moment"
import "moment/locale/nb"
import { GuidePanel, Select } from "@navikt/ds-react"
import Vaktperioder from "../components/Vaktperioder"
import { useAuth } from "../context/AuthContext"
import { Vaktlag } from "../types/types"

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale("nb")

    if (["vaktsjef", "leveranseleder"].includes(user.role))
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>
                                Her kan du generere nye vaktperioder for ditt
                                vaktlag:{" "}
                                {user.groups.length > 1 ? (
                                    <Select
                                        label="Velg vaktlag"
                                        onChange={(e) =>
                                            console.log(e.target.value)
                                        }
                                    >
                                        {user.groups.map((group: Vaktlag) => (
                                            <option
                                                key={group.id}
                                                value={group.id}
                                            >
                                                {group.name}
                                            </option>
                                        ))}
                                    </Select>
                                ) : (
                                    <b>{user.groups[0].name}</b>
                                )}
                                <br />
                                Ditt vaktlag er av typen:{" "}
                                <b>{user.groups[0].type}</b>
                            </p>
                        </GuidePanel>
                    </div>
                    <Vaktperioder></Vaktperioder>
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
