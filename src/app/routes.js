import { lazy } from "react";
import { Navigate } from "react-router-dom";

import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";

import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";
import PrivateRoute from "./views/sessions/login/PrivateRoute";

// E-CHART PAGE
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
// DASHBOARD PAGE
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const routes = [
  {
    path: "/",
    element: <Navigate to="session/signin" />
  },
  {
    element: <MatxLayout />,
    children: [
      ...materialRoutes,
      // dashboard route
      {
        path: "/dashboard/default",
        element: <PrivateRoute element={<Analytics />} />
      },
      // e-chart route
      {
        path: "/charts/echarts",
        element: <PrivateRoute element={<AppEchart />} />
      }
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;
