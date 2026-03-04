# UsrMgr
## WorkOS Frontend Take-Home Assignment

## How to run this project

Pull down this fork and run `git fetch` to get all of the branches. For final evaluation, checkout the branch `6-polish`.

In the `client` directory, run `npm install` to install the client-side dependencies. This will work with the same versions of node.js and npm used in the `server` directory.

In one terminal, get the server running -- `npm run api` in that `server` directory -- before starting; otherwise, you'll see an error view when starting the client.

To start the application, open another terminal window/tab and run `npm run dev` from the `client` directory. Navigate to `http://localhost:5173/` to start managing users. If you want to start with managing roles, navigate directly to `http://localhost:5173/?tab=roles`.

### Progression of work

Rather than breaking down the prescribed tasks into their own branches that built on each other, I decided to break the work down into what I'll call "waves". Each wave washes up on shore, leaves deposits, and recedes. Those deposits accrete and the final submission begins to form.

- `1-scaffold` is where the architecture is implemented and most of the functionality is built.
- `2-improve-styling` is where I zoomed in on the provided Figma mock, figuratively and literally.
- `3-a11y-pass` is where I identified and filled in gaps for accessibility.
- `4-animate` is where animations were expanded and improved.
- `5-error-states` is where more possible error states and suboptimal scenarios were addressed.
- `6-polish` is where I added some tests, a health check, and documentation.

## What you would improve or do differently

Before doing anything differently with the Roles view, I'd get feedback from more folks for that view (only asked one person). As it stands now, I think it's a smooth workflow that lets a user make inline edits. But, it would quickly get clumsy and crowded if we tried to edit more things inline or incorporated different interactions for editing. As an example of that, even though I look at the page most days, the GitHub PR view still throws me when editing a pull request title because the "edit" button is just for the title, and the PR description has a different interaction for editing it.

For the codebase, I'd add more tests. More specifically, a few "happy path" tests that exercise the full end-to-end flow (only a few because they are costly) and more tests at the component- and hook-level. I'd also add import sorting to the linting setup to enable easier scanning for folks reading the code.

## A word on tooling and process

From my perspective, the value of a take-home evaluation is seeing how a candidate can work when as many of the artificial constraints of the interview environment are removed. The candidate is working on a familiar machine, in a development environment that they've personalized over time -- from the operating system to the code editor or IDE. The idea is to see what the candidate can produce in a scenario that is as close to what the job expects as possible.

To that end, for this exercise, I opted to include in my toolbox something that's made a meaningful impact on my productivity over the last year: Claude Code. I set the requirements and standards up front (including the addition of a requirement for internationalization), pushed back on superfluous suggestions, and directed the output at each step where Claude Code handled implementation.
