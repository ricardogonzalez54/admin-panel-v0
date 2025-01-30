import { Outlet } from "react-router-dom";
import NavMenu from "./NavMenu";
import { PAGES } from "../utils/pagesConfig";

const Layout = () => {
  return (
    <>
      <NavMenu pages={PAGES} />
      <Outlet />
    </>
  );
};

export default Layout;
