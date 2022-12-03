const express = require("express");
const router = express.Router();
const userMiddelware = require("../middleware/authenticate");
const premiumController = require("../controllers/premium");

router.get(
  "/getAllExpenses",
  userMiddelware.userAuthenticate,
  premiumController.getAllExpenses
);
router.get(
  "/isPremium",
  userMiddelware.userAuthenticate,
  premiumController.getIsPremium
);
router.get(
  "/generateReport",
  userMiddelware.userAuthenticate,
  premiumController.getGenerateReport
);
module.exports = router;
