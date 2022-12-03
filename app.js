const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const sequelize = require("./util/database");
const userRoute = require("./routes/user");
const expenseRoute = require("./routes/expense");
const razorPayRoute = require("./routes/razorPay");
const premiumRoute = require("./routes/premium");
const forgotPassRoute = require("./routes/forgotPass");
const User = require("./model/user");
const Expense = require("./model/expense");
const ResetPass = require("./model/reset-password");
const FileLink = require("./model/file-link");

const app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/user", userRoute);
app.use("/expense", expenseRoute);
app.use("/razorPay", razorPayRoute);
app.use("/premiumUser", premiumRoute);
app.use("/password", forgotPassRoute);

app.use((req, res) => {
  console.log(req.url);
  res.send("Hello from express");
});

//one to many
User.hasMany(Expense);
Expense.belongsTo(User);
//one to many
User.hasMany(ResetPass);
ResetPass.belongsTo(User);
//one to many
User.hasMany(FileLink);
FileLink.belongsTo(User);

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log("Sequelize sync failed");
    console.log(err);
  });
