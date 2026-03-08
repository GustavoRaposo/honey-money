import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface AppInfo {
  name: string;
  version: string;
}

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
) as AppInfo;

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return { name: pkg.name, version: pkg.version };
  }
}
