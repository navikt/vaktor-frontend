import Navbar from "./NavBar";

const Layout = ({ children }) => {
    return (

        <div className="content" >
            <Navbar />
            {children}
        </div >
    );
}

export default Layout;