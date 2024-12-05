import { useContext } from "react";
import { SettingsContext } from "app/contexts/SettingsContext";

const useSettings = () => useContext(SettingsContext);
export default useSettings;

export let mergedSettings = {};

export const setMergedSettings = (newSettings) => {
  mergedSettings = newSettings;
};
