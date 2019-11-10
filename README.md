# screenshot-service
The screenshot service. Orchestrates the building/running of the docker images and taking the screenshots based on the scenarios.

## Project Structure
- `src`: TypeScript source files
- `public`: Swagger public resources
- `dist`: This is where the Chrome Extension will be built
  - `dist/`: Generated JavaScript bundles with source mapping, and assets

## Env
To run the code locally you need to create a `.env` file:

```
APP_ID=devq-scrnr
PORT=3000
LOG_LEVEL=debug
REQUEST_LIMIT=300kb
SESSION_SECRET=REPLACE_ME

OPENAPI_SPEC=/api/v1/spec
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
