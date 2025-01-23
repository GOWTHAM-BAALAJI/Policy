import { createContext, useContext, useState } from "react";

const UserGroupContext = createContext();

export function UserGroupProvider({ children }) {
  const [userGroup, setUserGroup] = useState(null);

  return (
    <UserGroupContext.Provider value={{ userGroup, setUserGroup }}>
      {children}
    </UserGroupContext.Provider>
  );
}

export function useUserGroup() {
  return useContext(UserGroupContext);
}
