import {
  Location,
  To,
  resolveTo,
  joinPaths,
  UNSAFE_getPathContributingMatches as getPathContributingMatches,
  createPath,
  Router,
  invariant,
  FormMethod,
  FormEncType,
} from "@remix-run/router";
import {
  Navigator,
  NavigateOptions,
  NavigateFunction,
  RelativeRoutingType,
} from "./types";
import { getFormSubmissionInfo, SubmitOptions } from "./dom";

export function useResolvedPath(
  matches: any[],
  location: Location,
  to: To,
  { relative }: { relative?: RelativeRoutingType } = {}
) {
  const routePathnames = getPathContributingMatches(matches).map(
    (match: any) => match.pathnameBase
  );

  let path = resolveTo(
    to,
    routePathnames,
    location.pathname,
    relative === "path"
  );
  return path;
}

export function useHref(
  basename: string,
  navigator: Navigator,
  matches: any[],
  location: Location
) {
  return (to: To, opts: { relative?: RelativeRoutingType } = {}) => {
    opts = opts ?? {};
    let { hash, pathname, search } = useResolvedPath(
      matches,
      location,
      to,
      opts
    );
    let joinedPathname = pathname;
    if (basename !== "/") {
      joinedPathname =
        pathname === "/" ? basename : joinPaths([basename, pathname]);
    }

    return navigator.createHref({ pathname: joinedPathname, search, hash });
  };
}

export function useNavigate(
  basename: string,
  navigator: Navigator,
  location: Location,
  matches: any
): NavigateFunction {
  return function navigate(to: To | number, options: NavigateOptions = {}) {
    if (typeof to === "number") {
      navigator.go(to);
      return;
    }
    const routePathnames = getPathContributingMatches(matches).map(
      (match: any) => match.pathnameBase
    );

    let path = resolveTo(
      to,
      routePathnames,
      location.pathname,
      options.relative === "path"
    );

    if (basename !== "/") {
      path.pathname =
        path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
    }

    (!!options.replace ? navigator.replace : navigator.push)(
      path,
      options.state,
      options
    );
  };
}

export function useFormAction(
  basename: string,
  matches: any,
  location: Location,
  action?: string,
  { relative }: { relative?: RelativeRoutingType } = {}
): string {
  // let routeContext = React.useContext(RouteContext);
  // invariant(routeContext, "useFormAction must be used inside a RouteContext");

  // let [match] = routeContext.matches.slice(-1);
  let match = matches.at(-1);
  let resolvedAction = action ?? ".";
  // Shallow clone path so we can modify it below, otherwise we modify the
  // object referenced by useMemo inside useResolvedPath
  let path = {
    ...useResolvedPath(matches, location, resolvedAction, { relative }),
  };

  // Previously we set the default action to ".". The problem with this is that
  // `useResolvedPath(".")` excludes search params and the hash of the resolved
  // URL. This is the intended behavior of when "." is specifically provided as
  // the form action, but inconsistent w/ browsers when the action is omitted.
  // https://github.com/remix-run/remix/issues/927
  // let location = useLocation();
  if (action == null) {
    // Safe to write to these directly here since if action was undefined, we
    // would have called useResolvedPath(".") which will never include a search
    // or hash
    path.search = location.search;
    path.hash = location.hash;

    // When grabbing search params from the URL, remove the automatically
    // inserted ?index param so we match the useResolvedPath search behavior
    // which would not include ?index
    if (match.route.index) {
      let params = new URLSearchParams(path.search);
      params.delete("index");
      path.search = params.toString() ? `?${params.toString()}` : "";
    }
  }

  if ((!action || action === ".") && match.route.index) {
    path.search = path.search
      ? path.search.replace(/^\?/, "?index&")
      : "?index";
  }

  // If we're operating within a basename, prepend it to the pathname prior
  // to creating the form action.  If this is a root navigation, then just use
  // the raw basename which allows the basename to have full control over the
  // presence of a trailing slash on root actions
  if (basename !== "/") {
    path.pathname =
      path.pathname === "/" ? basename : joinPaths([basename, path.pathname]);
  }

  return createPath(path);
}

export function useSubmitImpl(
  router: Router,
  basename: string,
  matches: any,
  location: Location,
  fetcherKey?: string,
  routeId?: string
): SubmitFunction {
  // let { router } = useDataRouterContext(DataRouterHook.UseSubmitImpl);
  let defaultAction = useFormAction(basename, matches, location);

  return (target, options = {}) => {
    if (typeof document === "undefined") {
      throw new Error(
        "You are calling submit during the server render. " +
          "Try calling submit within a `useEffect` or callback instead."
      );
    }

    let { method, encType, formData, url } = getFormSubmissionInfo(
      target,
      defaultAction,
      options
    );

    let href = url.pathname + url.search;
    let opts = {
      replace: options.replace,
      formData,
      formMethod: method as FormMethod,
      formEncType: encType as FormEncType,
    };
    if (fetcherKey) {
      invariant(routeId != null, "No routeId available for useFetcher()");
      router.fetch(fetcherKey, routeId, href, opts);
    } else {
      router.navigate(href, opts);
    }
  };
}

type SubmitTarget =
  | HTMLFormElement
  | HTMLButtonElement
  | HTMLInputElement
  | FormData
  | URLSearchParams
  | { [name: string]: string }
  | null;

/**
 * Submits a HTML `<form>` to the server without reloading the page.
 */
export interface SubmitFunction {
  (
    /**
     * Specifies the `<form>` to be submitted to the server, a specific
     * `<button>` or `<input type="submit">` to use to submit the form, or some
     * arbitrary data to submit.
     *
     * Note: When using a `<button>` its `name` and `value` will also be
     * included in the form data that is submitted.
     */
    target: SubmitTarget,

    /**
     * Options that override the `<form>`'s own attributes. Required when
     * submitting arbitrary data without a backing `<form>`.
     */
    options?: SubmitOptions
  ): void;
}
