const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

async function mail(subject, msg, useremail) {
  const mg = mailgun.client({
    username: 'api',
    key: process.env.mailgunkey,
  });
  mg.messages
    .create(process.env.sandbox, {
      from: `Task Manager <${process.env.email}>`,
      to: useremail,
      subject: subject,
      text: msg,
    })
    .then((message) => console.log("Message sent to the user: " + useremail))
    .catch(() => { }); // not logging any error
}

module.exports = mail