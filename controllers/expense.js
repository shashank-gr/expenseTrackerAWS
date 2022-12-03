const Expense = require("../model/expense");

exports.getAllExpenses = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const NUMBER_OF_EXPENSES_PER_PAGE = +req.query.paginate || 5;
    // console.log("req.query.paginate", NUMBER_OF_EXPENSES_PER_PAGE);
    // console.log(page);
    const userId = req.user.id;
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: { userId },
      limit: NUMBER_OF_EXPENSES_PER_PAGE,
      offset: (page - 1) * NUMBER_OF_EXPENSES_PER_PAGE,
    });
    const pagination = {
      currentPage: page,
      hasNextPage: count - page * NUMBER_OF_EXPENSES_PER_PAGE > 0,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(count / NUMBER_OF_EXPENSES_PER_PAGE),
    };
    res
      .status(200)
      .send({ expenses, pagination, msg: "Success, all expenses fetched" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

exports.postAddExpense = async (req, res) => {
  // console.log(req.body);
  const { amount, description, category } = req.body;
  if (amount == "" || description == "" || category == "") {
    return res.status(400).send({ msg: "Enter all input fields" });
  }
  try {
    const expense = await req.user.createExpense({
      amount,
      description,
      category,
    });
    res.status(201).send({ expense, msg: "success, added expense" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  const id = req.params.id;
  try {
    const expenses = await req.user.getExpenses({ where: { id } });
    expenses[0].destroy();
    res.status(200).send({ msg: "deleted from DB" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Internal server error" });
  }
};
