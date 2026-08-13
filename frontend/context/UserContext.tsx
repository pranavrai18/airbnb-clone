"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getUsers } from "@/lib/api";

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  switchUser: (userId: number) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  allUsers: [],
  switchUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((users) => {
        setAllUsers(users);
        // Default to Alice (guest, id=1)
        const defaultUser = users.find((u) => u.id === 1) || users[0];
        setCurrentUser(defaultUser);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const switchUser = (userId: number) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  return (
    <UserContext.Provider value={{ currentUser, allUsers, switchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
