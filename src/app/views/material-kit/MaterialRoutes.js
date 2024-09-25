import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PrivateRoute from "../sessions/login/PrivateRoute";
import { Apps } from "@mui/icons-material";

const AppForm = Loadable(lazy(() => import("./forms/AppForm")));
const AppMenu = Loadable(lazy(() => import("./menu/AppMenu")));
const AppIcon = Loadable(lazy(() => import("./icons/AppIcon")));
const AppProgress = Loadable(lazy(() => import("./AppProgress")));
const AppRadio = Loadable(lazy(() => import("./radio/AppRadio")));
const AppTable = Loadable(lazy(() => import("./tables/AppTable")));
const AppSwitch = Loadable(lazy(() => import("./switch/AppSwitch")));
const AppSlider = Loadable(lazy(() => import("./slider/AppSlider")));
const AppDialog = Loadable(lazy(() => import("./dialog/AppDialog")));
const AppButton = Loadable(lazy(() => import("./buttons/AppButton")));
const AppCheckbox = Loadable(lazy(() => import("./checkbox/AppCheckbox")));
const AppSnackbar = Loadable(lazy(() => import("./snackbar/AppSnackbar")));
const AppAutoComplete = Loadable(lazy(() => import("./auto-complete/AppAutoComplete")));
const AppExpansionPanel = Loadable(lazy(() => import("./expansion-panel/AppExpansionPanel")));

const materialRoutes = [
  { path: "/material/table", element: <PrivateRoute element={<AppTable />} /> },
  { path: "/material/form", element: <PrivateRoute element={<AppForm />} /> },
  { path: "/material/buttons", element: <PrivateRoute element={<AppButton />} /> },
  { path: "/material/icons", element: <PrivateRoute element={<AppIcon />} /> },
  { path: "/material/progress", element: <PrivateRoute element={<AppProgress />} /> },
  { path: "/material/menu", element: <PrivateRoute element={<AppMenu />} /> },
  { path: "/material/checkbox", element: <PrivateRoute element={<AppCheckbox />} /> },
  { path: "/material/switch", element: <PrivateRoute element={<AppSwitch />} /> },
  { path: "/material/radio", element: <PrivateRoute element={<AppRadio />} /> },
  { path: "/material/slider", element: <PrivateRoute element={<AppSlider />} /> },
  { path: "/material/autocomplete", element: <PrivateRoute element={<AppAutoComplete />} /> },
  { path: "/material/expansion-panel", element: <PrivateRoute element={<AppExpansionPanel />} /> },
  { path: "/material/dialog", element: <PrivateRoute element={<AppDialog />} /> },
  { path: "/material/snackbar", element: <PrivateRoute element={<AppSnackbar />} /> }
];

export default materialRoutes;
