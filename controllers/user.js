const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const User = require("../model/user");

const generateJWT = (obj) => {
  return jwt.sign(obj, process.env.JWT_SECRET);
};

exports.postSignUp = (req, res) => {
  const { name, email, password } = req.body;
  if (name == "" || email == "" || password == "") {
    return res
      .status(400)
      .send({ msg: "Bad parameters. Enter all the input fields" });
  }
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    // Store hash in your password DB.
    if (err) {
      console.log("bcrypt error :", err);
      return res.status(500).send({ msg: "Internal server error" });
    }
    try {
      const newUser = await User.create({
        name,
        email,
        password: hash,
      });
      res.status(200).send({ msg: "success user registered" });
    } catch (error) {
      res.status(400).send({
        msg: "User already exits with this email",
      });
    }
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  if (email == "" || password == "") {
    return res
      .status(400)
      .send({ msg: "Bad parameters. Enter all the input fields" });
  }

  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    // console.log(result);//null or data values
    if (!user) {
      return res.status(404).send({ msg: "user not found. Please signup" });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        // result == true
        if (err) {
          //  throw new Error("Internal server error")
          return res.status(500).send({ msg: "Internal server error" });
        }
        if (result) {
          return res.status(200).send({
            msg: "login success",
            token: generateJWT({
              userId: user.id,
              name: user.name,
            }),
          });
        } else {
          return res.status(401).send({ msg: "password incorrect" });
        }
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).send({ msg: "Inernal server error" });
  }
};
