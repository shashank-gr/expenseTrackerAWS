const toast = document.querySelector(".toast");
const btnForgotPass = document.querySelector(".btn.btn-forgot-pass");

//creating toastmessage
const createToast = (msg, color = "orangered") => {
  const div = document.createElement("div");
  div.innerHTML = msg;
  div.style.backgroundColor = color;
  toast.insertAdjacentElement("beforeend", div);
  setTimeout(() => {
    div.remove();
  }, 2000);
};

const login = async (e) => {
  e.preventDefault();
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  const data = { email, password };
  try {
    const response = await axios.post("http://localhost:3000/user/login", data);
    createToast(response.data.msg, "green");
    // console.log(response.data);
    localStorage.setItem("token", response.data.token);
    window.location.href = "./expense.html";
  } catch (error) {
    console.log(error);
    if (error.response.status == 400) {
      createToast(error.response.data.msg);
    } else if (error.response.status == 401) {
      createToast(error.response.data.msg);
    } else if (error.response.status == 404) {
      createToast(error.response.data.msg);
    } else if (error.response.status == 500) {
      createToast(error.response.data.msg);
    } else {
      console.log(error);
    }
  }
};
//post request to reset password
const forgetPassSubmit = async (e) => {
  e.preventDefault();
  // console.log(email);
  try {
    const email = e.target.querySelector("#forgot-pass-id").value;
    const data = { email };
    const response = await axios.post(
      "http://localhost:3000/password/forgotpassword",
      data
    );
    createToast(response.data.msg, "green");
  } catch (error) {
    console.log(error);
  }
};
const forgotPass = () => {
  const html = `<div id="container">
  <form id="new-form" onsubmit="forgetPassSubmit(event)">
    <p style="margin-bottom: 10px;">Please enter email address to <strong>RESET</strong> password</p>
      <div class="form-inputs">
        <input type="email" id='forgot-pass-id' name='email' placeholder="Enter Email" Required/>
        <button type="submit" class="btn" id='submit-forgot-pass'>REST PASSWORD</button>
        </div>
  </form>
</div>`;
  btnForgotPass.setAttribute("disabled", "");
  document.querySelector(".action-btns").insertAdjacentHTML("afterend", html);
};

btnForgotPass.addEventListener("click", forgotPass);
