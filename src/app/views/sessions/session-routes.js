import { lazy } from "react";
import Loadable from "app/components/Loadable";

const NotFound = Loadable(lazy(() => import("./NotFound")));
const ForgotPassword = Loadable(lazy(() => import("./ForgotPassword")));

const JwtLogin = Loadable(lazy(() => import("./login/JwtLogin")));

const sessionRoutes = [
  { path: "/", element: <JwtLogin /> },
  { path: "/forgotpwd", element: <ForgotPassword /> },
  { path: "*", element: <NotFound /> }
];

export default sessionRoutes;
