import { Location, History, To, Navigation } from "@remix-run/router";
import { LoaderFunction, RouteData } from "@remix-run/router/dist/utils";
import { TemplateResult, nothing } from "lit";
import { LimitedMouseEvent } from "./dom";

export type RelativeRoutingType = "route" | "path";

export interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
}

export interface Navigator {
  createHref: History["createHref"];
  go: History["go"];
  push(to: To, state?: any, opts?: NavigateOptions): void;
  replace(to: To, state?: any, opts?: NavigateOptions): void;
}

export interface NavigateFunction {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
}

export interface RemixBag {
  navigate: NavigateFunction;
  navigation: Navigation;
  location: Location;
  loaderData: any;
  routeLoaderData: RouteData;

  href: (to: To, opts?: { relative?: RelativeRoutingType }) => string;
  linkHandler: (e: MouseEvent) => void;
}

export type Element = (
  child: TemplateResult | typeof nothing,
  r: RemixBag
) => TemplateResult;

export interface Route {
  id?: string;
  path?: string;
  loader?: LoaderFunction;
  element?: Element;
  children?: Route[];
}

export type LinkNavigateOptions = {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
};
