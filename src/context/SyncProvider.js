import React, {
  useEffect,
} from "react";

import NetInfo
  from "@react-native-community/netinfo";

import {
  useAuth,
} from "./AuthContext";

import {
  syncPendingRegistrations,
} from "../services/registrationSync";


export default function SyncProvider({
  children,
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let active = true;

    const synchronizeIfOnline = (state) => {
      if (!active) {
        return;
      }

      if (
        state.isConnected === true &&
        state.isInternetReachable !== false
      ) {
        syncPendingRegistrations().catch(
          (error) => {
            console.warn(
              "ERROR SINCRONIZACIÓN:",
              error?.message
            );
          }
        );
      }
    };

    NetInfo.fetch()
      .then(synchronizeIfOnline)
      .catch(console.warn);

    const unsubscribe =
      NetInfo.addEventListener(
        synchronizeIfOnline
      );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id]);

  return <>{children}</>;
}