import { RouterState, Router } from "@remix-run/router";
import { useHref, useNavigate } from "./hooks";
import { Navigator, Route, RemixBag, LinkNavigateOptions } from "./types";
import { nothing, render, TemplateResult } from "lit";
import { LimitedMouseEvent, shouldProcessLinkClick } from "./dom";

export function mount(router: Router, target: HTMLElement): void {
  // from RouterProvider, react-router/lib/components.tsx
  const navigator: Navigator = {
    createHref: router.createHref,
    go: (n) => router.navigate(n),
    push: (to, state, opts) =>
      router.navigate(to, {
        state,
        preventScrollReset: opts?.preventScrollReset,
      }),
    replace: (to, state, opts) =>
      router.navigate(to, {
        replace: true,
        state,
        preventScrollReset: opts?.preventScrollReset,
      }),
  };
  let basename = router.basename || "/";

  const linkClickHandler = (
    event: MouseEvent, // is this legit?
    opts?: LinkNavigateOptions
  ): void => {
    event.preventDefault();
    let anchor = event
      .composedPath()
      .find(
        (element): element is HTMLAnchorElement =>
          element instanceof HTMLAnchorElement
      );
    if (anchor && shouldProcessLinkClick(event, anchor.target)) {
      router.navigate(anchor.href, opts);
    }
  };

  function renderRoutes(state: RouterState) {
    console.log(state);
    const {
      location,
      matches,
      navigation,
      loaderData: routeLoaderData,
    } = state;
    let template: TemplateResult | typeof nothing = nothing;
    for (let i = matches.length - 1; i >= 0; i--) {
      const route: Route = matches[i].route;
      if (route.element === undefined) {
        throw new Error("Every route needs an element.");
      }
      const loaderData =
        route.id === undefined ? undefined : routeLoaderData[route.id];
      const navigate = useNavigate(
        basename,
        navigator,
        location,
        matches.slice(0, i + 1)
      );
      const href = useHref(
        basename,
        navigator,
        matches.slice(0, i + 1),
        location
      );
      const r: RemixBag = {
        location,
        loaderData,
        routeLoaderData,
        navigate,
        navigation,
        href,
        linkHandler: linkClickHandler,
      };
      template = route.element(template, r);
    }
    render(template, target);
  }
  router.subscribe(renderRoutes);
}
