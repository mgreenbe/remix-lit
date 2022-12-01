import { createBrowserHistory, createRouter } from "@remix-run/router";
import { html } from "lit";
import { Route } from "./types";
import { mount } from "./mount";

const routes: Route[] = [
  {
    id: "outer",
    path: "/",
    element: (child, { routeLoaderData }) =>
      html`<div>
        <h1 data-remix-replace>root</h1>
        <p>${routeLoaderData["x"]}</p>
        ${child}
      </div>`,
    children: [
      {
        id: "x",
        path: "x",
        loader: () => "hi",
        element: (child, { href, loaderData }) =>
          html`<div>
            <h2>middle</h2>
            <p>${href("../hi")}</p>
            <p>${loaderData}</p>
            ${child}
          </div>`,
        children: [
          {
            id: "y",
            path: "y",
            element: (_, { href, linkHandler }) =>
              html`<div>
                <h3>inner</h3>
                <a href=${href("..")} @click=${linkHandler}>Back</a>
              </div>`,
          },
        ],
      },
    ],
  },
];

const history = createBrowserHistory();
const router = createRouter({ history, routes }).initialize();
mount(router, document.getElementById("app")!);
router.navigate("/x/y");
router.fetch;
