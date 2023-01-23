import type ApiDefinition from '../todo-api';
import createClient from 'typescript-rpc/createClient';
import app from './src/App';

export default class API {
  static client: Awaited<ReturnType<typeof createClient<typeof ApiDefinition>>>;
  async init(){
    API.client = await createClient();
  }
}

const api = new API();

(async () => {
  await api.init();
  app();
})();
