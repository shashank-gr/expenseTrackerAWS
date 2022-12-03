const express = require("express");
const router = express.Router();
const razorPayController = require("../controllers/razorPay");
const userMiddelware = require("../middleware/authenticate");

router.post(
  "/order",
  userMiddelware.userAuthenticate,
  razorPayController.postOrder
);
router.post(
  "/verifySignature",
  userMiddelware.userAuthenticate,
  razorPayController.postVerifySignature
);
module.exports = router;
