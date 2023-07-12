# DaggerUiTest

Showcase dagger build pipeline for Nx repositories.

This example shows a NestJS backend and an Angular frontend. The pipeline builds and publishes two individual
containers. Deployment could be done with docker compose. See the deployment-compose.yaml.

## Prerequisites

1. NodeJS 18 or later
2. Docker or compatible Container Engine
3. [Dagger.io CLI](https://docs.dagger.io/cli/465058/install)

## Usage

![dagger-demo.png](dagger-demo.gif)

1. ```shell
   npm install
   ```
2. ```shell
   dagger run npx ts-node --esm --project dagger/tsconfig.json dagger/build.mts --docker-prefix=your-registry
   ```
3. ```shell
   docker compose -f deployment-compose.yaml up
   ```
4. open [localhost:8080](http://localhost:8080)

## Builder Arguments

So far one argument can be passed to the `build.mts`

1. **docker-prefix (p)** : docker registry that you want to push into

Example:
```shell
#publish to dockerhub sirion182
dagger run npx ts-node --esm --project dagger/tsconfig.json dagger/build.mts --docker-prefix=sirion182
```

## Next possible steps

- add test execution into pipeline
- use containers to execute e2e tests
- add Kubernetes deployment example
- improve command line arguments
  - choose project to build
  - add [usage hints](https://www.npmjs.com/package/ts-command-line-args#user-content-usage-guide) 
- utilize affected graph of nx
- add example ci integration 
  - Github Action
  - Gitlab Pipeline
- add Secret Handling
