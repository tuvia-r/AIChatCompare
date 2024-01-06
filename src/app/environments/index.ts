import { environment as localEnvironment } from "./environment.local";
import { environment as prodEnvironment } from "./environment.prod";

declare let process: any;
const env = process.env.NODE_ENV;

console.log('env', env);

export const environment = env === 'production' ? prodEnvironment : localEnvironment;
