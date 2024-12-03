import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PrivateRoute from "../sessions/login/PrivateRoute";
import PrivateRoute3 from "../sessions/login/PrivateRoute3";
import PrivateRoute4 from "../sessions/login/PrivateRoute4";
import PrivateRoute5 from "../sessions/login/PrivateRoute5";

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
  { path: "/initiate/psg", element: <PrivateRoute4 element={<InitiatePSG />} /> },
  { path: "/list/psg", element: <PrivateRoute5 element={<ListPSG />} /> },
  { path: "/display/list", element: <PrivateRoute element={<ListApplicable />} />,},
  { path: "/initiate/ca", element: <PrivateRoute4 element={<InitiateCA />} /> },
  { path: "/list/ca", element: <PrivateRoute element={<ListCA />} /> },
  { path: "/policy/:id", element: <PrivateRoute element={<PolicyDetails />} /> },
  { path: "/admin", element: <PrivateRoute3 element={<Admin />} /> },
  { path: "/admin/user/:user_id", element: <PrivateRoute3 element={<AdminUserDetails />} /> },
  { path: "/admin/policy/:id", element: <PrivateRoute3 element={<AdminPolicyDetails />} /> },
  { path: "/admin/user/add", element: <PrivateRoute3 element={<AdminAddUser />} /> },
  { path: "/admin/policy/add", element: <PrivateRoute3 element={<AdminAddExistingPolicy />} /> },
  { path: "/admin/circular/add", element: <PrivateRoute3 element={<AdminAddExistingCircular />} /> },
];

export default materialRoutes;
