// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "ACabd64862202ee53ac334caaca13c2c96";
const authToken = "accaa1a51390b3c71a1a92fb8837b954";
const client = require("twilio")(accountSid, authToken);

client.calls.create({
  url: "https://32dbba5b109d.ngrok-free.app/voice",
  to: "+918667600879",
  from: "+18153653095"
})
.then(call => console.log(call.sid));

client.calls("CAcb2cdeb9177946d41c96a93048ec68f1")
  .fetch()
  .then(call => console.log(call.status));
