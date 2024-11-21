import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PrivateRoute from "../sessions/login/PrivateRoute";

const InitiatePSG = Loadable(lazy(() => import("./initiate/InitiatePSG")));
const ListPSG = Loadable(lazy(() => import("./list/ListPSG")));
const ListApplicable = Loadable(lazy(() => import("./list/ListApplicable")));
const InitiateCA = Loadable(lazy(() => import("./initiate/InitiateCA")));
const ListCA = Loadable(lazy(() => import("./list/ListCA")));
const PolicyDetails = Loadable(lazy(() => import("./list/PolicyDetails")));
const Admin = Loadable(lazy(() => import("./admin/AdminPage")));
const AdminPolicyDetails = Loadable(lazy(() => import("./admin/PolicyDetails")));
const AdminUserDetails = Loadable(lazy(() => import("./admin/UserDetails")));
const AdminAddUser = Loadable(lazy(() => import("./admin/AddNewUser")));
const AdminAddExistingPolicy = Loadable(lazy(() => import("./admin/AddExistingPolicy")));
const AdminAddExistingCircular = Loadable(lazy(() => import("./admin/AddExistingCircular")));

const materialRoutes = [
  { path: "/initiate/psg", element: <PrivateRoute element={<InitiatePSG />} /> },
  { path: "/list/psg", element: <PrivateRoute element={<ListPSG />} /> },
  { path: "/display/list", element: <PrivateRoute element={<ListApplicable />} />,},
  { path: "/initiate/ca", element: <PrivateRoute element={<InitiateCA />} /> },
  { path: "/list/ca", element: <PrivateRoute element={<ListCA />} /> },
  { path: "/policy/:id", element: <PrivateRoute element={<PolicyDetails />} /> },
  { path: "/admin", element: <PrivateRoute element={<Admin />} /> },
  { path: "/admin/user/:user_id", element: <PrivateRoute element={<AdminUserDetails />} /> },
  { path: "/admin/policy/:id", element: <PrivateRoute element={<AdminPolicyDetails />} /> },
  { path: "/admin/user/add", element: <PrivateRoute element={<AdminAddUser />} /> },
  { path: "/admin/policy/add", element: <PrivateRoute element={<AdminAddExistingPolicy />} /> },
  { path: "/admin/circular/add", element: <PrivateRoute element={<AdminAddExistingCircular />} /> },
];

export default materialRoutes;
