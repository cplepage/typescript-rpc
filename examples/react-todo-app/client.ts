import type ApiDefinition from './server';
import createClient from 'typescript-rpc/createClient';
import app from './src/App';

const client = createClient<typeof ApiDefinition>();

app();

export default client;
