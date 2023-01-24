import type ApiDefinition from './todo-api';
import createClient from 'typescript-rpc/createClient';
import app from './src/App';

const client = createClient<ApiDefinition>();

(async () => {
  await client.ready();
  app();
})();

export default client;
