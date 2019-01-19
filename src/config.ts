import dotenv = require("dotenv");
dotenv.config();

import * as envalid from "envalid";
const { str } = envalid;

export class ConfigModel {
  GITHUB_OAUTH2_TOKEN: string;
}

export const config = envalid.cleanEnv<ConfigModel>(process.env, {
  GITHUB_OAUTH2_TOKEN: str(),
}, {
  strict: true,
});
