import UserModel from "../models/userModel.js";

export class AccountInfoManager {
  #userdata;

  constructor(userdata) {
    this.#userdata = userdata;
  }

  async getAccountInfo(
    request
  ) {
    try {
      const d = await UserModel.findById(params.accountid);
    } catch (err) {
      console.log("err", err.message);
    }
  }
  async UpdateAccountInfo() {
    try {
      const d = await UserModel.findByIdAndUpdate();
    } catch (err) {
      console.log("err", err.message);

    }
  }
}
