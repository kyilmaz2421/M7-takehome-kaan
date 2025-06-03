import axios from "axios";
import { ApiServiceHandler } from "./apiServiceHandler";

const API_BASE_URL = "http://localhost:3000";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

export default new ApiServiceHandler(instance);
