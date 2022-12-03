const form = document.querySelector("#form");
const ul = document.querySelector(".list");
const ulOthers = document.querySelector(".list-others");
const goPremium = document.querySelector("#go-premium");
const toast = document.querySelector(".toast-msg");
const paginationDiv = document.querySelector(".pagination-btns");
const paginationDivOthers = document.querySelector(".pagination-btns-others");
const paginateRows = document.querySelector("#paginate-rows");

let order;

axios.defaults.headers.common["Authorization"] = localStorage.getItem("token");

const createToast = (msg, color = "orangered") => {
  // console.log("toast created");
  const div = document.createElement("div");
  div.innerHTML = msg;
  div.style.backgroundColor = color;
  toast.insertAdjacentElement("afterbegin", div);
  setTimeout(() => {
    div.remove();
    // console.log("div removed");
  }, 2000);
};

const displayPaginationOthers = ({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  lastPage,
}) => {
  const div = document.querySelector(".pagination-btns-others div");
  if (hasNextPage && hasPreviousPage && nextPage != lastPage) {
    div.innerHTML = ` <button >${previousPage}</button>
    <button class="active">${currentPage}</button>
    <button >${nextPage}</button>
    <button >${lastPage}</button>`;
  } else if (hasNextPage && hasPreviousPage) {
    div.innerHTML = ` <button >${previousPage}</button>
    <button class="active">${currentPage}</button>
    <button >${nextPage}</button>`;
  } else if (!hasNextPage && !hasPreviousPage) {
    div.innerHTML = `<button class="active">${currentPage}</button>`;
  } else if (!hasPreviousPage && hasNextPage && nextPage != lastPage) {
    div.innerHTML = `<button class="active">${currentPage}</button>
    <button >${nextPage}</button>
    <button >${lastPage}</button>`;
  } else if (!hasPreviousPage && hasNextPage) {
    div.innerHTML = `<button class="active">${currentPage}</button>
    <button >${nextPage}</button>`;
  } else if (hasPreviousPage && !hasNextPage && previousPage != 1) {
    div.innerHTML = `<button>${1}</button>
    <button>${previousPage}</button>
    <button class="active">${currentPage}</button>`;
  } else if (hasPreviousPage && !hasNextPage) {
    div.innerHTML = `<button>${previousPage}</button>
    <button class="active">${currentPage}</button>`;
  }
  const closeBtn = document.querySelector("#close-all-expenses");
  closeBtn.addEventListener("click", () => {
    document.querySelector(".list-others").innerHTML = "";
    closeBtn.classList = "btn btn-danger disabled";
    document.querySelector(".pagination-btns-others div").innerHTML = "";
    document.querySelector("#get-all-expenses").classList = "btn btn-success";
  });
};

const displayOtherUserExpenses = ({ amount, description, category }) => {
  const li = document.createElement("li");
  li.classList = "list-group-item";
  li.appendChild(
    document.createTextNode(`${amount} ${description} ${category}`)
  );
  ulOthers.insertAdjacentElement("beforeend", li);
};

const getAllUsersExpenses = async (page = 1) => {
  try {
    document.querySelector("#get-all-expenses").classList =
      "btn btn-success disabled";
    document.querySelector("#close-all-expenses").classList = "btn btn-danger";
    ulOthers.innerHTML = "";
    const paginate = localStorage.getItem("paginate-rows") || 5;
    const response = await axios.get(
      `http://localhost:3000/premiumUser/getAllExpenses?page=${page}&paginate=${paginate}`
    );
    // console.log(response.data.pagination);
    const expenses = response.data.expenses;
    // console.log(response.data.msg);
    expenses.forEach((expense) => {
      displayOtherUserExpenses(expense);
    });
    displayPaginationOthers(response.data.pagination);
    createToast(response.data.msg, "green");
  } catch (error) {
    console.log(error);
    if (error.response.status == 500) {
      console.log(error.response.data.msg);
      createToast(error.response.data.msg);
    }
  }
};
const onPaginationBtnclickOthers = (e) => {
  if (e.target.tagName == "BUTTON") {
    const page = e.target.textContent;
    getAllUsersExpenses(page);
  }
};
const generateReport = async () => {
  try {
    const respone = await axios.get(
      "http://localhost:3000/premiumUser/generateReport"
    );
    if (respone.status == 200) {
      const a = document.createElement("a");
      a.setAttribute("href", `${respone.data.reportLink}`);
      a.setAttribute("download", "");
      a.click();
    }
  } catch (error) {
    console.log(error);
  }
};

const premiumFeature = () => {
  goPremium.remove();
  document.querySelector("body").style.backgroundColor = "#222";
  const div = document.createElement("div");
  div.classList = "premium-btns-container";
  div.style.margin = "1rem auto";
  const btns = `<button id="get-all-expenses" class="btn btn-success">All Users Expenses</button>
  <button id="close-all-expenses"  class="btn btn-danger disabled">Close Expenses</button>
  <button id="download-report"  class="btn btn-success">Generate Report</button>`;
  div.insertAdjacentHTML("afterbegin", btns);
  paginationDiv.insertAdjacentElement("afterend", div);

  const btnGetAllExpenses = document.querySelector("#get-all-expenses");
  btnGetAllExpenses.addEventListener("click", getAllUsersExpenses);

  const btnGenerateReport = document.querySelector("#download-report");
  btnGenerateReport.addEventListener("click", generateReport);
};
const verifySignature = async (
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature
) => {
  try {
    const data = { razorpay_payment_id, razorpay_order_id, razorpay_signature };
    const respone = await axios.post(
      "http://localhost:3000/razorPay/verifySignature",
      data
    );
    // console.log(respone.data.msg);

    document.getElementById("rzp-button1").remove();
    createToast(respone.data.msg, "green");
    premiumFeature();
  } catch (error) {
    console.log(error);
    if (error.response.status == 400) {
      // console.log(error.response.data.msg);
      createToast(error.response.data.msg);
    }
  }
};
const onPay = (e) => {
  var options = {
    key: "rzp_test_LoUvvQ4sZ9FkMo", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Shashanka Inc.",
    description: "Get Premium expense tracker features",
    // image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
      // alert(response.razorpay_signature);
      verifySignature(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature
      );
    },
    theme: {
      color: "#0a58ca",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.on("payment.failed", function (response) {
    alert(response.error.code);
    alert(response.error.description);
    alert(response.error.source);
    alert(response.error.step);
    alert(response.error.reason);
    alert(response.error.metadata.order_id);
    alert(response.error.metadata.payment_id);
  });

  rzp1.open();
};

const onGoPremium = async (e) => {
  try {
    const response = await axios.post("http://localhost:3000/razorPay/order");
    order = response.data.order;
    // console.log(order);
    goPremium.remove();
    const btnHTML = `<button id="rzp-button1" class="btn btn-success">pay</button>`;
    paginationDiv.insertAdjacentHTML("afterend", btnHTML);
    document.getElementById("rzp-button1").addEventListener("click", onPay);
  } catch (error) {
    console.log(error);
    createToast(error.response.data.msg);
  }
};
const onClick = async (e) => {
  if (e.target.classList == "btn btn-danger float-end") {
    // console.log(e.target.parentElement);
    const id = e.target.parentElement.querySelector(".user-id").value;
    try {
      const response = await axios.delete(
        `http://localhost:3000/expense/deleteExpense/${id}`
      );

      if (response.status == 200) {
        e.target.parentElement.remove();
        // console.log(response.data.msg);
        createToast(response.data.msg, "green");
      }
    } catch (error) {
      console.log(error);
      if (error.response.status == 500) {
        // console.log(error.response.data.msg);
        createToast(error.response.data.msg);
      }
    }
  }
};
const displayExpense = ({ id, amount, description, category }) => {
  const li = document.createElement("li");
  const btnDel = document.createElement("button");
  // const btnEdit = document.createElement("button");
  const input = document.createElement("input");
  input.className = "user-id";
  input.type = "hidden";
  input.value = id;
  btnDel.className = "btn btn-danger float-end";
  // btnEdit.className = "btn btn-light float-end";
  // btnEdit.textContent = "Edit";
  btnDel.textContent = "Delete";

  li.classList = "list-group-item";
  li.appendChild(
    document.createTextNode(`${amount} ${description} ${category}`)
  );
  li.insertAdjacentElement("beforeend", btnDel);
  // li.insertAdjacentElement("beforeend", btnEdit);
  li.insertAdjacentElement("beforeend", input);
  ul.insertAdjacentElement("beforeend", li);
};
const onSubmit = async (e) => {
  e.preventDefault();

  const expenseAmount = document.querySelector("#amount");
  const expenseDetails = document.querySelector("#details");
  const expenseCategory = document.querySelector("#category");
  const data = {
    amount: expenseAmount.value,
    description: expenseDetails.value,
    category: expenseCategory.value,
  };
  try {
    const response = await axios.post(
      "http://localhost:3000/expense/addexpense",
      data
    );
    console.log(response.data);
    displayExpense(response.data.expense);
    createToast(response.data.msg, "green");
    expenseAmount.value = "";
    expenseDetails.value = "";
    expenseCategory.value = "";
  } catch (error) {
    console.log(error);
    if (error.response.status == 500) {
      console.log(error.response.data.msg);
      createToast(error.response.data.msg);
    }
  }
};

const displayPagination = ({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  lastPage,
}) => {
  const pagination = document.querySelector(".pagination-btns");
  if (hasNextPage && hasPreviousPage && nextPage != lastPage) {
    pagination.innerHTML = ` <button >${previousPage}</button>
    <button class="active">${currentPage}</button>
    <button >${nextPage}</button>
    <button >${lastPage}</button>`;
  } else if (hasNextPage && hasPreviousPage) {
    pagination.innerHTML = ` <button >${previousPage}</button>
    <button class="active">${currentPage}</button>
    <button >${nextPage}</button>`;
  } else if (!hasNextPage && !hasPreviousPage) {
    pagination.innerHTML = `<button class="active">${currentPage}</button>`;
  } else if (!hasPreviousPage && hasNextPage && nextPage != lastPage) {
    pagination.innerHTML = `<button class="active">${currentPage}</button>
    <button >${nextPage}</button>
    <button >${lastPage}</button>`;
  } else if (!hasPreviousPage && hasNextPage) {
    pagination.innerHTML = `<button class="active">${currentPage}</button>
    <button >${nextPage}</button>`;
  } else if (hasPreviousPage && !hasNextPage && previousPage != 1) {
    pagination.innerHTML = `<button>${1}</button>
    <button>${previousPage}</button>
    <button class="active">${currentPage}</button>`;
  } else if (hasPreviousPage && !hasNextPage) {
    pagination.innerHTML = `<button>${previousPage}</button>
    <button class="active">${currentPage}</button>`;
  }
};

const fetchPaginationExpenses = async (page = 1) => {
  try {
    ul.innerHTML = "";
    const paginate = localStorage.getItem("paginate-rows") || 5;
    // console.log(paginate);
    const response = await axios.get(
      `http://localhost:3000/expense/getExpenses?page=${page}&paginate=${paginate}`
    );
    response.data.expenses.forEach((expense) => {
      displayExpense(expense);
    });
    // console.log(response.data.pagination);
    displayPagination(response.data.pagination);
    // console.log(response.data.msg);
    createToast(response.data.msg, "green");
  } catch (error) {
    console.log(error);
    createToast(error.response.data.msg);
  }
};
const onPaginationBtnclick = (e) => {
  if (e.target.tagName == "BUTTON") {
    const page = e.target.textContent;
    fetchPaginationExpenses(page);
  }
};
const onDOMloaded = async () => {
  try {
    // console.log(response);//all the expenses
    const premium = await axios.get(
      "http://localhost:3000/premiumUser/isPremium"
    );
    if (premium.data.isPremium) {
      premiumFeature();
    }
    fetchPaginationExpenses(1);
  } catch (error) {
    console.log(error);
    if (error.response.status == 500) {
      // console.log(error.response.data.msg);
      createToast(error.response.data.msg);
    }
  }
};
const onPaginateRows = (e) => {
  e.preventDefault();
  const paginate = document.querySelector("#paginate-rows-number").value;
  localStorage.setItem("paginate-rows", paginate);
};
form.addEventListener("submit", onSubmit);
document.addEventListener("DOMContentLoaded", onDOMloaded);
ul.addEventListener("click", onClick);
goPremium.addEventListener("click", onGoPremium);
paginationDiv.addEventListener("click", onPaginationBtnclick);
paginationDivOthers.addEventListener("click", onPaginationBtnclickOthers);
paginateRows.addEventListener("submit", onPaginateRows);
console.log(paginateRows);
