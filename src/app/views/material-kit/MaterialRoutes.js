import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PrivateRoute from "../sessions/login/PrivateRoute";
import { Apps } from "@mui/icons-material";

const InitiatePSG = Loadable(lazy(() => import("./initiate/InitiatePSG")));
const ListPSG = Loadable(lazy(() => import("./list/ListPSG")));
const InitiateCA = Loadable(lazy(() => import("./initiate/InitiateCA")));
const ListCA = Loadable(lazy(() => import("./list/ListCA")));
const PolicyDetails = Loadable(lazy(() => import("./list/PolicyDetails")));
const ListApproved = Loadable(lazy(() => import("../dashboard/Approved")));
const ListRejected = Loadable(lazy(() => import("../dashboard/Rejected")));
const ListApprovalPending = Loadable(lazy(() => import("../dashboard/Approvalpending")));
const ListReviewraised = Loadable(lazy(() => import("../dashboard/Reviewraised")));
const ListDataTables = Loadable(lazy(() => import("./list/ListDataTables")));
const ListUsers = Loadable(lazy(() => import("./list/ListUsers")));

const materialRoutes = [
  { path: "/list/dt", element: <PrivateRoute element={<ListDataTables />} /> },
  { path: "/list/users", element: <PrivateRoute element={<ListUsers />} /> },
  { path: "/initiate/psg", element: <PrivateRoute element={<InitiatePSG />} /> },
  { path: "/list/psg", element: <PrivateRoute element={<ListPSG />} /> },
  { path: "/initiate/ca", element: <PrivateRoute element={<InitiateCA />} /> },
  { path: "/list/ca", element: <PrivateRoute element={<ListCA />} /> },
  { path: "/policy/:id", element: <PrivateRoute element={<PolicyDetails />} /> },
  { path: "/list/approved", element: <PrivateRoute element={<ListApproved />} /> },
  { path: "/list/rejected", element: <PrivateRoute element={<ListRejected />} /> },
  { path: "/list/approvalpending", element: <PrivateRoute element={<ListApprovalPending />} /> },
  { path: "/list/reviewraised", element: <PrivateRoute element={<ListReviewraised />} /> },
];

export default materialRoutes;
