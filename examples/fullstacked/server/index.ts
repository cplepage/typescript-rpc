import Server from "fullstacked/server";
import api from "../api";
import createHandler from "typescript-rpc/createHandler";

Server.addListener(createHandler(api));
