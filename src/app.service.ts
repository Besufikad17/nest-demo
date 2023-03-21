import { Injectable } from '@nestjs/common';
import { IEmployee } from './utils/types.ts';

@Injectable()
export class AppService {
    getEmployee(): IEmployee {
        return 'Hello World!';
    }
}
