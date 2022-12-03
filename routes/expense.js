const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense");
const userMiddelware = require("../middleware/authenticate");

router.post(
  "/addexpense",
  userMiddelware.userAuthenticate,
  expenseController.postAddExpense
);
router.get(
  "/getExpenses",
  userMiddelware.userAuthenticate,
  expenseController.getAllExpenses
);
router.delete(
  "/deleteExpense/:id",
  userMiddelware.userAuthenticate,
  expenseController.deleteExpense
);

module.exports = router;
