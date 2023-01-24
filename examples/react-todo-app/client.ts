import type ApiDefinition from './server';
import createClient from 'typescript-rpc/createClient';
import app from './src/App';

const client = createClient<typeof ApiDefinition>();

(async () => {
  await client.ready();
  app();
})();

export default client;
