# screenshot-service
The screenshot service. Orchestrates the building/running of the docker images and taking the screenshots based on the scenarios.

## Project Structure
- `src`: TypeScript source files
- `public`: Swagger public resources
- `dist`: This is where the Chrome Extension will be built
  - `dist/`: Generated JavaScript bundles with source mapping, and assets

## Install `docker`:

    * [Mac](https://docs.docker.com/engine/installation/mac/) /
    * [Windows](https://docs.docker.com/engine/installation/windows/) /
    * [Ubuntu](https://docs.docker.com/engine/installation/linux/ubuntulinux/)

Make sure that docker is available as a command line exec:

`docker -v`

Prints something like: `Docker version 19.03.4, build 9013bf5`

## Env
To run the code locally you need to create a `.env` file:
Ask Andrei for a GCP key.

```
APP_ID=devq-scrnr
PORT=3000
LOG_LEVEL=debug
REQUEST_LIMIT=300kb
SESSION_SECRET=<REPLACE_ME>
GITHUB_BASE=https://api.github.com/repos
GITHUB_FORMAT=tarball
CODE_DIR=code
OPENAPI_SPEC=/api/v1/spec
GOOGLE_APPLICATION_CREDENTIALS=\User\Home\<path-to-the-key>\key.json
BACK_API_AUTH=<REPLACE_ME>
BACK_API_BASE_URL=http://f8867ec3.ngrok.io/admin/api/v1
SCENARIOS=/scenarios
```

## Development build
Runs directly the `ts` files. 
```
npm run dev
```

## Production build
Generates the minified bundles
```
npm run compile
```
