/**
 * Standalone DataSource for the TypeORM CLI (migration generate/run/revert).
 * Loaded via `-d src/database/data-source.ts` (dev) or
 * `-d dist/database/data-source.js` (deploy). Not used by the running app —
 * the NestJS module builds its own connection from the same options builder.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm-options';

dotenv.config();

export default new DataSource(buildDataSourceOptions((k) => process.env[k]));
