const SibApiV3Sdk = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { v4: uuidv4 } = require("uuid");
const User = require("../model/user");
const ResetPass = require("../model/reset-password");
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SEND_IN_BLUE_KEY;

//send mail using send in blue
exports.postForgotPass = async (req, res) => {
  // console.log(req.body.email);
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const restPass = await user.createResetPass({ id: uuidv4() });
      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

      sendSmtpEmail = {
        to: [
          {
            email: email,
            name: user.name,
          },
        ],
        templateId: 1,
        params: {
          name: user.name,
          id: restPass.id,
        },
      };
      apiInstance
        .sendTransacEmail(sendSmtpEmail)
        .then((data) => {
          console.log(data);
          res
            .status(201)
            .send({ msg: "mail has been set to registered email" });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send({ msg: "Internal server error" });
        });
    } else {
      res.status(400).send({ msg: "User not found, please sign up" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

//send the reset password UI if valid
exports.getResetPassword = async (req, res) => {
  const passId = req.params.id;
  // console.log(passId);
  try {
    const resetPassRow = await ResetPass.findByPk(passId);
    if (resetPassRow && resetPassRow.isResetActive) {
      // console.log(path.dirname(require.main.filename));
      res.status(200).send(`<form
      action="http://localhost:3000/password/updatepassword/${resetPassRow.id}"
      method="get"
    >
      <h3>Enter new password</h3>
      <label for="pass">Password</label>
      <input type="password" name="pass" id="pass" required />
      <button type="submit">UPDATE PASSWORD</button>
    </form>
    `);
    } else {
      res.status(400).send({ msg: "Reset link already used" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

//to update new password
exports.getUpdatePassword = async (req, res) => {
  const pass = req.query.pass;
  const id = req.params.id;
  try {
    const resetPassrow = await ResetPass.findByPk(id);
    // console.log(resetPassrow);
    if (!resetPassrow) {
      return res.status(400).send("Reset password link expired");
    }
    bcrypt.hash(pass, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).send({ msg: "Internal server error" });
      }
      await User.update(
        { password: hash },
        { where: { id: resetPassrow.userId } }
      );
      await ResetPass.update(
        { isResetActive: false },
        { where: { id: resetPassrow.id } }
      );
      res.status(200).send("password reset successfull");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};
