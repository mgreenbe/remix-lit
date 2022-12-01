import { RouterState, Router, FormMethod } from "@remix-run/router";
import { Route, LinkNavigateOptions } from "./types";
import { nothing, render, TemplateResult } from "lit";
import { shouldProcessLinkClick } from "./dom";

export function mount(router: Router, target: HTMLElement): void {
  function linkClickHandler(
    event: MouseEvent,
    opts?: LinkNavigateOptions
  ): void {
    let anchor = event
      .composedPath()
      .find(
        (element): element is HTMLAnchorElement =>
          element instanceof HTMLAnchorElement
      );
    if (anchor && shouldProcessLinkClick(event, anchor.target)) {
      event.preventDefault();
      router.navigate(anchor.href, opts);
    }
  }
  target.addEventListener("click", linkClickHandler);

  function submitHandler(e: SubmitEvent) {
    console.log("Submitted!");
    e.preventDefault();
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) {
      throw new Error(
        "(submit handler) event target must be an instance of HTMLFormElement."
      );
    }
    const action =
      form.getAttribute("action") ?? router.state.location.pathname;
    const formData = new FormData(form);
    const name = e.submitter?.getAttribute("name");
    if (name) {
      const value = e.submitter?.getAttribute("value") ?? "";
      formData.set(name, value);
    }

    const formMethod = (form.getAttribute("method") ?? "get") as FormMethod;
    if (formMethod === "get") {
      const search = new URLSearchParams(formData as any).toString(); //  👎
      router.navigate({ pathname: action, search });
    }

    const opts = { formData, formMethod };

    const fetcherKey = form.dataset.fetcherKey;
    if (fetcherKey === undefined) {
      router.navigate(action, opts);
    } else {
      const routeId = form.dataset.routeId;
      if (routeId === undefined) {
        throw new Error("When fetcherKey is defined, routeId must be, too.");
      }
      router.fetch(fetcherKey, routeId, action, opts);
    }
  }
  target.addEventListener("submit", submitHandler);

  function renderMatches(routerState: RouterState) {
    console.log(routerState);

    let template: TemplateResult | typeof nothing = nothing;
    for (let i = routerState.matches.length - 1; i >= 0; i--) {
      const match = routerState.matches[i];
      const route: Route = match.route;
      if (route.element !== undefined) {
        template = route.element(template, {
          routerState,
          match: routerState.matches[i],
          navigate: router.navigate,
          fetch: router.fetch,
        });
      }
    }
    render(template, target);
  }
  router.subscribe(renderMatches);
}
