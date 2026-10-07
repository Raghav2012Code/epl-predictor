import React from "react";
import { pathForAppRoute, type AppRoute } from "../lib/appRoute";

type RouteLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  /** Runs after a plain click, before navigating (for example to close search). */
  onFollow?: () => void;
};

/**
 * A real link for in-app navigation: it has a URL, so middle-click, "open in
 * new tab" and copy-link work, while a plain click stays a client-side route change.
 */
export const RouteLink: React.FC<RouteLinkProps> = ({ route, onNavigate, onFollow, ...rest }) => (
  <a
    {...rest}
    href={pathForAppRoute(route)}
    onClick={(event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      onFollow?.();
      onNavigate(route);
    }}
  />
);
