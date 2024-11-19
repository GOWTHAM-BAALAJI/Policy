import { lazy } from "react";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";
import PrivateRoute from "./views/sessions/login/PrivateRoute";
import PrivateRoute1 from "./views/sessions/login/PrivateRoute1";
import PrivateRoute2 from "./views/sessions/login/PrivateRoute2";

const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));
const JwtLogin = Loadable(lazy(() => import("./views/sessions/login/JwtLogin")));
const Profile = Loadable(lazy(() => import("./views/profile/Profile")));

const routes = [
  {
    path: "/",
    element: <PrivateRoute2 element={<JwtLogin />} />
  },
  {
    element: <MatxLayout />,
    children: [
      ...materialRoutes,
      {
        path: "/dashboard",
        element: <PrivateRoute1 element={<Analytics />} />
      },
      {
        path: "/profile",
        element: <PrivateRoute element={<Profile />} />
      },
    ]
  },

  ...sessionRoutes
];

export default routes;
