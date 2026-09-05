const axios = require("axios");

const MPESA_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
};

const generatePassword = (shortcode, passkey, timestamp) => {
  const str = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(str).toString("base64");
};

const formatPhone = (phone) => {
  // Convert 07xxxxxxxx or +2547xxxxxxxx to 2547xxxxxxxx
  phone = phone.replace(/\s/g, "").replace(/^\+/, "");
  if (phone.startsWith("0")) {
    phone = "254" + phone.substring(1);
  }
  return phone;
};

const stkPush = async ({ amount, phoneNumber, accountReference, transactionDesc }) => {
  const accessToken = await getAccessToken();

  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .substring(0, 14);

  const password = generatePassword(shortcode, passkey, timestamp);
  const formattedPhone = formatPhone(phoneNumber);

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || "TikTaskHub",
      TransactionDesc: transactionDesc || "Membership Payment",
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data;
};

module.exports = { getAccessToken, stkPush };
