import { createBrowserHistory, createRouter } from "@remix-run/router";
import { html } from "lit";
import { Route } from "./types";
import { mount } from "./mount";

const routes: Route[] = [
  {
    id: "outer",
    path: "/",
    element: (child, { routerState: { loaderData } }) =>
      html`<div>
        <h1 data-remix-replace>root</h1>
        <p>${loaderData["x"]}</p>
        ${child}
      </div>`,
    children: [
      {
        id: "x",
        path: "x",
        loader: () => "hi",
        action: () => console.log("Hi!!"),
        element: (child, { routerState: { loaderData } }) =>
          html`<div>
            <h2>middle</h2>
            <p>${JSON.stringify(loaderData)}</p>
            <form><input name="input" /><button>Submit</button></form>
            ${child}
          </div>`,
        children: [
          {
            id: "y",
            path: "y",
            element: (_, {}) =>
              html`<div>
                <h3>inner</h3>
                <a href=${"/x"}>Back</a>
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
