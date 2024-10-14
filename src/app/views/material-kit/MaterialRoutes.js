import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PrivateRoute from "../sessions/login/PrivateRoute";

const InitiatePSG = Loadable(lazy(() => import("./initiate/InitiatePSG")));
const ListPSG = Loadable(lazy(() => import("./list/ListPSG")));
const ListApplicable = Loadable(lazy(() => import("./list/ListApplicable")));
const InitiateCA = Loadable(lazy(() => import("./initiate/InitiateCA")));
const ListCA = Loadable(lazy(() => import("./list/ListCA")));
const PolicyDetails = Loadable(lazy(() => import("./list/PolicyDetails")));
const ListDataTables = Loadable(lazy(() => import("./list/ListDataTables")));
const ListUsers = Loadable(lazy(() => import("./list/ListUsers")));

const materialRoutes = [
  { path: "/list/dt", element: <PrivateRoute element={<ListDataTables />} /> },
  { path: "/list/users", element: <PrivateRoute element={<ListUsers />} /> },
  { path: "/initiate/psg", element: <PrivateRoute element={<InitiatePSG />} /> },
  { path: "/list/psg", element: <PrivateRoute element={<ListPSG />} /> },
  { path: "/display/list", element: <PrivateRoute element={<ListApplicable />} />,
  },
  { path: "/initiate/ca", element: <PrivateRoute element={<InitiateCA />} /> },
  { path: "/list/ca", element: <PrivateRoute element={<ListCA />} /> },
  { path: "/policy/:id", element: <PrivateRoute element={<PolicyDetails />} /> },
];

export default materialRoutes;
