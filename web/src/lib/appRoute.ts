export type AppRoute =
  | "landing"
  | "fixtures"
  | "simulator"
  | "standings"
  | "clubs"
  | "analytics";

const routePaths: Record<AppRoute, string> = {
  landing: "/",
  fixtures: "/fixtures",
  simulator: "/simulator",
  standings: "/table",
  clubs: "/clubs",
  analytics: "/analytics",
};

export const dashboardRoutes: Array<Exclude<AppRoute, "landing">> = [
  "fixtures",
  "simulator",
  "standings",
  "clubs",
  "analytics",
];

const routesByPath = {
  ...(Object.fromEntries(
    Object.entries(routePaths).map(([route, path]) => [path, route]),
  ) as Record<string, AppRoute>),
  "/standings": "standings",
} as Record<string, AppRoute>;

export const appRouteForPath = (pathname: string): AppRoute =>
  routesByPath[pathname.replace(/\/$/, "") || "/"] ?? "landing";

/** The address a pathname should show: aliases, trailing slashes and unknown paths resolve to a real route. */
export const canonicalPath = (pathname: string): string =>
  pathForAppRoute(appRouteForPath(pathname));

export const pathForAppRoute = (route: AppRoute): string => routePaths[route];
