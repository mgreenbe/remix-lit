import { RouterState, Router } from "@remix-run/router";
import {
  ActionFunction,
  AgnosticDataRouteMatch,
  LoaderFunction,
} from "@remix-run/router/dist/utils";
import { TemplateResult, nothing } from "lit";

export type RelativeRoutingType = "route" | "path";

export type Element = (
  child: TemplateResult | typeof nothing,
  {
    routerState,
    match,
    navigate,
    fetch,
  }: {
    routerState: RouterState;
    match: AgnosticDataRouteMatch;
    navigate: Router["navigate"];
    fetch: Router["fetch"];
  }
) => TemplateResult;

export interface Route {
  id?: string;
  path?: string;
  loader?: LoaderFunction;
  action?: ActionFunction;
  element?: Element;
  children?: Route[];
}

export type LinkNavigateOptions = {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
};
