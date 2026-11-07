import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../lib/supabase";

import {
  getProfileRequest,
  loginRequest,
  logoutRequest,
} from "../services/authApi";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {
  const [
    session,
    setSession,
  ] = useState(null);

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    perfil,
    setPerfil,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
   * Restaurar sesión cuando
   * abre KaabMap.
   */
  useEffect(() => {
    let mounted = true;


    async function restoreSession() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth
            .getSession();

        if (error) {
          throw error;
        }

        const currentSession =
          data?.session ??
          null;

        if (!mounted) {
          return;
        }

        setSession(
          currentSession
        );

        setUser(
          currentSession?.user ??
          null
        );

        if (
          currentSession?.user
        ) {
          try {
            const profile =
              await getProfileRequest(
                currentSession
                  .user.id
              );

            if (mounted) {
              setPerfil(
                profile
              );
            }
          } catch (error) {
            console.error(
              "Error restaurando perfil:",
              error
            );

            if (mounted) {
              setPerfil(null);
            }
          }
        }
      } catch (error) {
        console.error(
          "Error restaurando sesión:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    restoreSession();


    /*
     * Escuchar cambios en Auth.
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (
            _event,
            newSession
          ) => {
            if (!mounted) {
              return;
            }

            setSession(
              newSession
            );

            setUser(
              newSession
                ?.user ??
              null
            );

            if (!newSession) {
              setPerfil(null);
            }
          }
        );


    return () => {
      mounted = false;

      subscription
        .unsubscribe();
    };
  }, []);


  /*
   * Login desde LoginScreen.
   */
  const login =
    async (
      email,
      password
    ) => {
      const result =
        await loginRequest({
          email,
          password,
        });

      setSession(
        result.session
      );

      setUser(
        result.user
      );

      setPerfil(
        result.perfil
      );

      return result;
    };


  /*
   * Cerrar sesión.
   */
  const logout =
    async () => {
      await logoutRequest();

      setSession(null);
      setUser(null);
      setPerfil(null);
    };


  /*
   * Recargar perfil manualmente.
   */
  const refreshProfile =
    async () => {
      if (!user?.id) {
        return null;
      }

      const profile =
        await getProfileRequest(
          user.id
        );

      setPerfil(
        profile
      );

      return profile;
    };


  const isAuthenticated =
    Boolean(
      session &&
      user &&
      perfil
    );


  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        perfil,

        loading,

        isAuthenticated,

        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
}