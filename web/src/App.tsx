import React, { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppSkeleton, DataErrorPanel } from "./components/DataStates";
import { useEPLData } from "./hooks/useEPLData";
import { MotionPreferenceProvider, MotionPresence, RouteFade } from "./components/Motion";
import { AppShell } from "./components/AppShell";
import { LandingPage } from "./components/landing/LandingPage";
import { appRouteForPath, canonicalPath, pathForAppRoute, type AppRoute } from "./lib/appRoute";

const routeTitles: Record<AppRoute, string> = {
  landing: "EPL Predictor 2026/27 — Premier League Match & Score Intelligence",
  fixtures: "Fixtures · EPL Predictor",
  simulator: "Simulator · EPL Predictor",
  standings: "Table · EPL Predictor",
  clubs: "Clubs · EPL Predictor",
  analytics: "Analytics · EPL Predictor",
};

export const App: React.FC = () => {
  const state = useEPLData();
  const [route, setRoute] = useState<AppRoute>(() =>
    appRouteForPath(window.location.pathname),
  );
  useEffect(() => {
    const { pathname } = window.location;
    if (canonicalPath(pathname) !== pathname) {
      window.history.replaceState({}, "", canonicalPath(pathname) + window.location.search + window.location.hash);
    }
    const onPopState = () => setRoute(appRouteForPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const firstRoute = useRef(true);
  useEffect(() => {
    document.title = routeTitles[route];
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [route]);
  const navigate = (nextRoute: AppRoute) => {
    const nextPath = pathForAppRoute(nextRoute);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const [motionDisabled, setMotionDisabled] = useState(false);
  const toggleMotion = () => setMotionDisabled((value) => !value);
  if (state.status === "loading")
    return (
      <MotionPreferenceProvider disabled={motionDisabled}>
        <ErrorBoundary>
          {route === "landing" ? (
            <LandingPage
              onNavigate={navigate}
              motionDisabled={motionDisabled}
              onToggleMotion={toggleMotion}
            />
          ) : (
            <AppSkeleton />
          )}
        </ErrorBoundary>
      </MotionPreferenceProvider>
    );
  if (state.status === "error")
    return (
      <ErrorBoundary>
        <DataErrorPanel error={state.error} onRetry={state.retry} />
      </ErrorBoundary>
    );
  return (
    <MotionPreferenceProvider disabled={motionDisabled}>
      <ErrorBoundary>
        <MotionPresence>
          {route === "landing" ? (
            <RouteFade routeKey="landing">
              <LandingPage
                dataset={state.dataset}
                onNavigate={navigate}
                motionDisabled={motionDisabled}
                onToggleMotion={toggleMotion}
              />
            </RouteFade>
          ) : (
            <RouteFade routeKey="workspace">
              <AppShell
                dataset={state.dataset}
                initialTab={route}
                onNavigate={navigate}
                motionDisabled={motionDisabled}
                onToggleMotion={toggleMotion}
              />
            </RouteFade>
          )}
        </MotionPresence>
      </ErrorBoundary>
    </MotionPreferenceProvider>
  );
};
export default App;
