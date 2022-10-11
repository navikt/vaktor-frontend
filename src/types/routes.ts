// Landing page
export enum RouterHomePage {
    NAME = "Home",
    PATH = "/sp"
}
// ---


// Default dashboards
export enum RouterPrivatperson {
    NAME = "Privatperson",
    PATH = "/Dashboard/Privatperson"
}

export enum RouterArbeidsgiver {
    NAME = "Arbeidsgiver",
    PATH = "/Dashboard/Arbeidsgiver"
}

export enum RouterSamarbeidspartner {
    NAME = "Samarbeidspartner",
    PATH = "/Dashboard/Samarbeidspartner"
}

export enum RouterInternt {
    NAME = "Internt",
    PATH = "/Dashboard/Internt"
}
// ---



// Admin
export enum RouterAdmin {
    NAME = "Admin",
    PATH = "/Admin?tab=Tjenester"
}

export enum RouterAdminDashboards {
    NAME = "Admin - Dashboards",
    PATH = "/Admin?tab=Dashbord"
}

export enum RouterAdminAddDashboard {
    NAME = "Admin - NewDashboard",
    PATH = "/Admin/NyttDashbord"
}

export enum RouterAdminOmråder {
    NAME = "Admin - Områder",
    PATH = "/Admin?tab=Områder"
}

export enum RouterAdminAddOmråde {
    NAME = "Admin - Områder",
    PATH = "/Admin/NyttOmraade"
}

export enum RouterAdminTjenester {
    NAME = "Admin - Tjenester",
    PATH = "/Admin?tab=Tjenester"
}

export enum RouterAdminAddTjeneste {
    NAME = "Admin - Tjenester",
    PATH = "/Admin/NyTjeneste"
}

export enum RouterAdminKomponenter {
    NAME = "Admin - Komponenter",
    PATH = "/Admin?tab=Komponenter"
}

export enum RouterAdminAddKomponent {
    NAME = "Admin - Komponenter",
    PATH = "/Admin/NyKomponent"
}
// ---





// TjensteData
export enum RouterTjenestedata {
    NAME = "Admin - Tjenester",
    PATH = "/Tjenestedata/"
}
// ---





// Avvikshistorikk
export enum RouterAvvikshistorikk {
    NAME = "Avvikshistorikk",
    PATH = "/Avvikshistorikk"
}
// ---


// OPSMeldinger
export enum RouterOpsMeldinger {
    NAME = "Avviksmeldinger",
    PATH = "/Avviksmeldinger"
}

export enum RouterOpprettOpsMelding {
    NAME = "Opprett driftsmelding",
    PATH = "Avviksmeldinger/OpprettMelding"
}
// ---



// OpprettVarsling
export enum RouterOpprettVarsling {
    NAME = "Opprett Varsling",
    PATH = "/OpprettVarsling"
}

export enum RouterConfirmedCreation {
    NAME = "Profil opprettet",
    PATH = "/ProfilOpprettet"
}
// ---




// Login & Logout
export enum RouterLogin {
    NAME = "Logg inn",
    PATH = "/Login"
}

export enum RouterOauthLogin {
    NAME = "LoginAzure",
    //  PATH = "/authenticate/login"
    PATH = "/oauth2/login?redirect="+ "/sp"
}

export enum RouterLogout {
    NAME = "Logg ut",
    PATH = "/sp/oauth2/logout"
}
// ---


// Error
export enum RouterError {
    NAME = "Error side",
    PATH = "/Custom404"
}
// ---



// Feedback form
export enum RouterFeedbackForm {
    NAME = "Feedback skjema",
    PATH = "/FeedbackSkjema"
}
// ---