// import React, { useEffect } from 'react';
// import { createRoot } from 'react-dom/client';
// import { Provider, useDispatch } from 'react-redux';
// import { RouterProvider, createBrowserRouter } from 'react-router-dom';
// import { store } from '../redux/store';
// import { useRoutes } from "react-router-dom";
// import CssBaseline from "@mui/material/CssBaseline";
// import { clearJwtToken, setupActivityListeners, clearActivityListeners } from '../redux/idleTimeout';

// import { MatxTheme } from "./components";
// import SettingsProvider from "./contexts/SettingsContext";
// import routes from "./routes";
// import "../fake-db";

// export default function App() {
//   const content = useRoutes(routes);

//   const rootElement = document.getElementById('root');
//   const root = createRoot(rootElement);
//   root.render(
//     <React.StrictMode>
//         <Provider store={store}>
//             <RouterProvider router={routes} />
//             <IdleTimeoutHandler />
//         </Provider>
//     </React.StrictMode>,
//   )


//   function IdleTimeoutHandler() {
//     const dispatch = useDispatch();

//     useEffect(() => {
//       setupActivityListeners(dispatch);

//       return () => {
//         clearActivityListeners();
//       };
//     }, [dispatch]);

//     return null; 
//   }

//   return (
//     <SettingsProvider>
//       <MatxTheme>
//         <CssBaseline />
//         {content}
//       </MatxTheme>
//     </SettingsProvider>
//   );
// }



























import React, { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import CssBaseline from "@mui/material/CssBaseline";
import { setupActivityListeners, clearActivityListeners } from '../redux/idleTimeout';
import { useDispatch } from 'react-redux';
import SettingsProvider from "./contexts/SettingsContext";
import { MatxTheme } from "./components";
// ROUTES
import routes from "./routes";
// FAKE SERVER
// import "../fake-db";

function IdleTimeoutHandler() {
  const dispatch = useDispatch();

  useEffect(() => {
    setupActivityListeners(dispatch);

    return () => {
      clearActivityListeners();
    };
  }, [dispatch]);

  return null; 
}

const App = () => {

  return (
    <SettingsProvider>
      <MatxTheme>
        <CssBaseline />
        <RouterProvider router={createBrowserRouter(routes)} />
        <IdleTimeoutHandler />
      </MatxTheme>
    </SettingsProvider>
  );
}

export default App;
