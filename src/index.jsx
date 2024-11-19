import React from 'react';
import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import "perfect-scrollbar/css/perfect-scrollbar.css";

const root = createRoot(document.getElementById("root"));

root.render(
    <Provider store={store}>
      <App />
    </Provider>
);

serviceWorker.unregister();
