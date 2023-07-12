import Client, {Container, Directory, connect} from '@dagger.io/dagger'
import {parse} from 'ts-command-line-args'

const args = parse({
  'docker-prefix': {type: String, alias: 'p', defaultValue: 'sirion182'},
})

connect(async (client: Client) => {
  const builder = createBuilderContainer(client)

  const builderFrontend = builder
    .pipeline('build frontend')
    .withExec(['npx', 'nx', 'build', 'dagger-ui-test'])

  const buildBackend = builder
    .pipeline('build backend')
    .withExec(['npx', 'nx', 'build', 'dagger-ui-backend'])

  const nestJSRunner = nestJsBuilder(client, buildBackend.directory('dist/apps/dagger-ui-backend'))

  const angularRunner = angularContainer(client, builderFrontend.directory('dist/apps/dagger-ui-test'), 'dagger-ui-backend')

  const publish = Promise.all([
    nestJSRunner.publish(`${args["docker-prefix"]}/dagger-ui-backend:latest`),
    angularRunner.publish(`${args["docker-prefix"]}/dagger-ui-test`),
  ])

  await publish
}, { LogOutput: process.stdout })


/**
 * creates a builder container with mounted local path to `/workdir`.
 * The dependencies are installed using a mounted cache directory
 *
 * @param client dagger client to pass on
 * @param localPath mounted to `/workdir`, defaults to `.`
 * @param label pipline label
 * @returns builder container with installed dependencies
 */
function createBuilderContainer(client: Client, localPath: string = '.', label: string = 'ci pipeline'): Container {
  const nodeCache = client.cacheVolume('node')
  const src = client.host().directory(localPath, {exclude: ['node_modules']})

  return client.container()
    .pipeline(label)
    .from('node:20-alpine')
    .withMountedDirectory('/workdir', src)
    .withMountedCache('/workdir/node_modules', nodeCache)
    .withWorkdir('/workdir')
    .pipeline('install dependencies')
    .withExec(['npm', 'install', '--legacy-peer-deps'])
}

function nestJsBuilder(client: Client, distDir: Directory, label: string = 'build NestJS Container'): Container {
  return client.container()
    .pipeline(label)
    .from('node:20-alpine')
    .withDirectory('/nest', distDir)
    .withWorkdir('/nest')
    .withExec(['npm', 'ci', '--omit=dev', '--legacy-peer-deps'])
    .withEntrypoint(['node', '/nest/main.js'])
}

/**
 * create the nginx config for the angular container
 * @param apiUrl
 */
function nginxConf(apiUrl: string | undefined) {
  // language=Nginx Configuration File
  return `server {
  listen 8080;
  sendfile on;
  default_type application/octet-stream;

  gzip on;
  gzip_http_version 1.1;
  gzip_disable      "MSIE [1-6]\.";
  gzip_min_length   256;
  gzip_vary         on;
  gzip_proxied      expired no-cache no-store private auth;
  gzip_types        text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_comp_level   9;

  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html =404;
  }
  ${nginxProxyConf(apiUrl)}
}
`
}

function nginxProxyConf(apiUrl: string | undefined) {
  return apiUrl === undefined ? '' : `resolver 127.0.0.11 valid=30s;

  # proxy to backend
  location ~/${apiUrl}(.*)$ {
    proxy_pass \${BACKEND_URI}/${apiUrl}$1;
    proxy_http_version 1.1;

    proxy_set_header Host               $host;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto  $scheme;
  }`
}

function angularContainer(client: Client, distDir: Directory, apiUrl?: string | undefined, label: string = 'build Angular Container'): Container {
  const nginxConfig = nginxConf(apiUrl);
  return client.container()
    .pipeline(label)
    .from('nginxinc/nginx-unprivileged:1.25.1-alpine')
    .withNewFile('/etc/nginx/templates/default.conf.template', {contents: nginxConfig})
    .withDirectory('/usr/share/nginx/html', distDir)
}
