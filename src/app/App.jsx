import React, { useState, useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import CssBaseline from "@mui/material/CssBaseline";
import { setupActivityListeners, clearActivityListeners } from '../redux/idleTimeout';
import { useDispatch } from 'react-redux';
import SettingsProvider from "./contexts/SettingsContext";
import { MatxTheme } from "./components";
import routes from "./routes";
import { Toaster } from 'react-hot-toast';

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
  const [profilepic, setProfilepic] = useState(null);

  return (
    <SettingsProvider>
      <MatxTheme>
        <CssBaseline />
        <RouterProvider router={createBrowserRouter(routes)} element={profilepic} />
        <IdleTimeoutHandler />
      </MatxTheme>
      <Toaster/>
    </SettingsProvider>
  );
}

export default App;
