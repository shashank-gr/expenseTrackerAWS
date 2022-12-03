const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");
const User = require("../model/user");
var instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

exports.postOrder = async (req, res) => {
  try {
    const options = {
      amount: 1000,
      currency: "INR",
      receipt: "receipt#1",
    };
    const order = await instance.orders.create(options);
    // console.log(order);
    // console.log(req.user);
    await req.user.update({ orderId: order.id });
    res.status(200).send({ order });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Internal Server error" });
  }
};

exports.postVerifySignature = async (req, res) => {
  // console.log(req.body);
  const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
    .update(body.toString())
    .digest("hex");

  // console.log("sig received ", req.body.razorpay_signature);
  // console.log("sig generated ", expectedSignature);

  if (expectedSignature === req.body.razorpay_signature) {
    req.user.update({ isPremium: true });
    return res.status(200).send({ msg: "Payment success" });
  } else {
    res.status(400).send({ msg: "Payment failed" });
  }
};
