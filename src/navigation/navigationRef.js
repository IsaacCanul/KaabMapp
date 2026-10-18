import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function openLogin(params = {}) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("Auth", {
    screen: "Login",
    params,
  });
}

export function openRegister(params = {}) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("Auth", {
    screen: "Register",
    params,
  });
}

export function closeAuthFlow() {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate("MainApp");
}
