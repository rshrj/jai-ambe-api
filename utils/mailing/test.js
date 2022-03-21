const sendMail = require('./sendmail');

(async () => {
  await sendMail({
    to: ['abc@gmail.com', 'tetris@gmail.com'],
    from: process.env.SMTPUSER,
    subject: 'Password Reset',
    template: 'reset',
    templateVars: {
      emailAddress: 'abc@gmail.com',
      resetLink: 'https://twitter.com'
    }
  });
})();
