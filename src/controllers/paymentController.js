const Transaction = require('../models/transactionModel');
const axios = require('axios');
const config = require('../configs/config');
const {generateHmacSha256Hash, generateUniqueId} = require('../services/helper');
const { Booking } = require('../models/bookingModel');

const initiatePayment = async (req, res) =>{
    try{
        const userId = req.userId;
        const {
            bookingId,
            paymentGateway,
            customerName,
            customerPhone,
            productName,
        } = req.body;

        if (!paymentGateway) {
            return res.status(400).json({ error: "Payment gateway is required" });
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Could not find the booking"});
        }
        if (!booking.customer.equals(userId)){
            return res.status(403).json({ error: "Unauthorized access"});
        }
        const amount = booking.cost;
        const customerDetails = {
            name: customerName,
            phone: customerPhone,
        };
        
        const transactionData = {
            customerDetails,
            product_name: productName,
            product_id: bookingId,
            amount,
            payment_gateway: paymentGateway,
        };
        let paymentConfig;
        if (paymentGateway === "esewa") {
            const paymentData = {
                amount,
                failure_url: config.FAILURE_URL,
                product_delivery_charge: "0",
                product_service_charge: "0",
                product_code: config.ESEWA_MERCHANT_ID,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                success_url: config.SUCCESS_URL,
                tax_amount: "0",
                total_amount: amount,
                transaction_uuid: generateUniqueId(),
            };

            const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
            const signature = generateHmacSha256Hash(data, config.ESEWA_SECRET);

            paymentConfig = {
                url: config.ESEWA_PAYMENT_URL,
                data: { ...paymentData, signature },
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                responseHandler: (response) => response.request?.res?.responseUrl,
            };
        } else {
            return res.status(400).json({ error: "Invalid payment gateway" });
        }
        // Make payment request
        const payment = await axios.post(paymentConfig.url, paymentConfig.data, {
            headers: paymentConfig.headers,
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
        });

        const paymentUrl = payment.headers.location;
        if (!paymentUrl) {
            throw new Error("Payment URL is missing in the response");
        }
        // Save transaction record
        const transaction = new Transaction(transactionData);
        await transaction.save();

        return res.send({ url: paymentUrl });
    } catch (e) {
        console.error("Error initiating payment:",e);
        return res.status(500).json({error: "Server error. Please try again later."});
    }
};

const paymentStatus = async (req, res) => {
  const { bookingId, status } = req.body;
  try {
    const transaction = await Transaction.findOne({ product_id: bookingId });
    if (!transaction) {
      return res.status(400).json({ error: "Transaction not found" });
    }

    const { payment_gateway } = transaction;

    if (status === "FAILED") {
      // Directly update status when failure is reported
      await Transaction.updateOne(
        { product_id: bookingId },
        { $set: { status: "FAILED", updatedAt: new Date() } }
      );

      return res.status(200).json({
        error: "Transaction status updated to FAILED",
        status: "FAILED",
      });
    }

    let paymentStatusCheck;

    if (payment_gateway === "esewa") {
      const paymentData = {
        product_code: config.ESEWA_MERCHANT_ID,
        total_amount: transaction.amount,
        transaction_uuid: transaction.product_id,
      };

      const response = await axios.get(
        config.ESEWA_PAYMENT_STATUS_CHECK_URL,
        {
          params: paymentData,
        }
      );

      paymentStatusCheck = response.data;
        const fields = paymentStatusCheck.signed_field_names.split(",");
        const dataString = fields.map(f => `${f}=${paymentStatusCheck[f]}`).join(",");
        const expectedSignature = generateHmacSha256Hash(dataString, config.ESEWA_SECRET);

        if (expectedSignature !== paymentStatusCheck.signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }

        if (transaction.amount !== paymentStatusCheck.total_amount) {
            return res.status(400).json({ error: "Amount mismatch" });
        }
      if (paymentStatusCheck.status === "COMPLETE") {
        await Transaction.updateOne(
          { product_id: bookingId },
          { $set: { status: "COMPLETED", updatedAt: new Date() } }
        );
        await Booking.updateOne(
            { _id: bookingId },
            { $set: { paymentDone: true}}
        );
        return res.status(200).json({
          message: "Transaction status updated successfully",
          status: "COMPLETED",
        });
      } else {
        await Transaction.updateOne(
          { product_id: bookingId },
          { $set: { status: "FAILED", updatedAt: new Date() } }
        );

        return res.status(200).json({
          error: "Transaction status updated to FAILED",
          status: "FAILED",
        });
      }
    }

    return res.status(400).json({ error: "Invalid payment gateway" });
  } catch (error) {
    console.error("Error during payment status check:", error);
    res.status(500).send({
      message: "Payment status check failed",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {initiatePayment, paymentStatus};