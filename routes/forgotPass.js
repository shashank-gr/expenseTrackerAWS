const express = require("express");
const router = express.Router();
const forgotPassController = require("../controllers/forgotPass");

router.post("/forgotpassword", forgotPassController.postForgotPass);
router.get("/resetpassword/:id", forgotPassController.getResetPassword);
router.get("/updatepassword/:id", forgotPassController.getUpdatePassword);
module.exports = router;
