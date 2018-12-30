import { ClosePR } from "../../../models";

export function constructClose(): ClosePR {

  try {
    // Base properties
    const description: string = "";
    const title: string = "";
    const pr_url: string = "";

    // ClosePR properties
    const owner: string = "";
    const user_closing: string = "";

    // Construct ClosePR object to return
    const closeObj: ClosePR = {
      description: description,
      title: title,
      url: pr_url,
      owner: owner,
      user_closing: user_closing,
    };

    return closeObj;
  }
  catch (error) {
    throw new Error(error.message);
  }
}
