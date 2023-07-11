import {Injectable} from '@nestjs/common';
import {ToDo} from "@dagger-ui-test/shared";

@Injectable()
export class AppService {
  getData(): ToDo[] {
    return [
      {
        id: '1c7876f9-9b1c-42da-97ca-8fcd2451ef9b',
        name: 'Angular lernen',
        description: 'Wichtig um tolle Frontends entwickeln zu können',
        assigned: 'bob@builder.com'
      },
      {
        id: 'e22d0f6b-9960-434e-b7c6-87b800504654',
        name: 'NestJS lernen',
        description: 'Backends in Typescripts schreiben, Mega!',
        assigned: 'alice@builder.com'
      },
      {
        id: 'a6bade0f-a437-428e-b138-a1f63d21749c',
        name: 'TypeORM einbauen',
        description: 'Datenbanken könnten wichtig sein?',
        assigned: 'eve@build.com'
      },
      {
        id: '8c1760ae-540d-4e2a-b875-239f10038071',
        name: 'Mit Dagger die portable CI/CD Pipeline bauen',
        description: 'Datenbanken könnten wichtig sein?',
        assigned: 'eve@build.com'
      }]
  }
}
