import { OpenedPR } from "../../../models";

export function constructOpen(): OpenedPR {
  try {
    // Base Properties
    const description: string = "";
    const title: string = "";
    const pr_url: string = "";

    // OpenedPr Properties
    const owner: string = "";

    // If group exists in config file

    // Construct OpenPR object to return
    const openObj: OpenedPR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
    };

    return openObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
