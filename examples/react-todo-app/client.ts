import type ApiDefinition from './server';
import createClient from 'typescript-rpc/createClient';
import app from './src/App';

const client = createClient<typeof ApiDefinition>();

(async () => {
  client.deserializer = (response) => response.json();
  await client.ready();
  app();
})();

export default client;
