# UsrMgr
## WorkOS Frontend Take-Home Assignment

## Get started

In the `client` directory, run `npm install` to install the client-side dependencies.

Make sure you have the server running -- `npm run api` in the `server` directory -- before starting; otherwise, you'll see an error view.

To start the application, run `npm run dev` from the `client` directory and navigate to `http://localhost:5173/` to start managing users. Likewise, navigate to `http://localhost:5173/?tab=roles` to start managing roles.

## Decision points

- using same dev tooling/versions as server code for easiest interop
- went with vite and react because of past experiences of speed for development, agreeable defaults
- typescript for the power (and guardrail) of types
- no router because don't need the overhead; we can get all we need with query params
- i18n because this represents an enterprise application
- dark mode because computer people love dark mode (give the people what they want)
- radix themes because i want to work at workos and be productive there, which means (partly) getting more experience with the stack
- tanstack's react query because it deals with the whole host of async state management without manual intervention
- radix icons for consistency with visual language with radix themes
