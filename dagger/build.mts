import Client, { Container, Directory, File, connect } from '@dagger.io/dagger'

connect(async (client: Client) => {
  const builder = createBuilderContainer(client)

  const builderFrontend = builder
    .withExec(['npx', 'nx', 'build', 'dagger-ui-test'])

  const buildBackend = builder
    .withExec(['npx', 'nx', 'build', 'dagger-ui-backend'])
    .withExec(['cp', 'package.json', 'package-lock.json', 'decorate-angular-cli.js', 'dist/apps/dagger-ui-backend'])

  const nestJSRunner = nestJsContainer(client, buildBackend.directory('dist/apps/dagger-ui-backend'))
  const angularRunner = angularContainer(client, builderFrontend.directory('dist/apps/dagger-ui-test'), 'dagger-ui-test')


  await nestJSRunner.publish('sirion182/dagger-ui-backend:latest')
  await angularRunner.publish('sirion182/dagger-ui-test')
}, { LogOutput: process.stdout })


/**
 * creates a builder container with mounted local path to `/workdir`.
 * The dependencies are installed using a mounted cache directory
 *
 * @param client dagger client to pass on
 * @param localPath mounted to `/workdir`, defaults to `.`
 * @returns builder container with installed dependencies
 */
function createBuilderContainer(client: Client, localPath: string = '.'): Container {
  const nodeCache = client.cacheVolume('node')
  const src = client.host().directory(localPath, { exclude: ['node_modules'] })

  return client.container()
    .from('node:20-alpine')
    .withMountedDirectory('/workdir', src)
    .withMountedCache('/workdir/node_modules', nodeCache)
    .withWorkdir('/workdir')
    .withExec(['npm', 'install', '--legacy-peer-deps'])
}

function nestJsContainer(client: Client, distDir: Directory): Container {
  return client.container()
    .from('node:20-alpine')
    .withDirectory('/nest', distDir)
    .withWorkdir('/nest')
    .withExec(['npm', 'ci', '--omit=dev', '--legacy-peer-deps'])
    .withEntrypoint(['node', '/nest/main.js'])
}

function nginxConf(apiUrl: string) {
  return `server {
  listen 80;
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

  # proxy to backend
  location ~/${apiUrl}(.*)$ {
    proxy_pass \${BACKEND_URI}/${apiUrl}$1;
    proxy_http_version 1.1;

    proxy_set_header Host               $host;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto  $scheme;
  }
}
`
}

function angularContainer(client: Client, distDir: Directory, apiUrl: string): Container {
  return client.container()
    .from('nginx:1.25.1-alpine')
    .withNewFile('/etc/nginx/templates/default.conf.template', { contents: nginxConf(apiUrl) })
    .withDirectory('/usr/share/nginx/html', distDir)
}
