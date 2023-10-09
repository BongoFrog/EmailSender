const nodemailer = require('nodemailer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
//  subject and context for email
const subject = 'Hello from Node.js';
const context = 'This is a test email from Node.js';

const isCSVFile = (filePath) => path.extname(filePath) === '.csv';

const SendMail = process.argv[2].toString();
const ReceiveMail = process.argv[3].toString();
// check if file valid
if (!isCSVFile(SendMail)) {
  console.log('Invalid Sender CSV file');
  process.exit(1);
}

if (!isCSVFile(ReceiveMail)) {
  console.log('Invalid Receiver CSV file');
  process.exit(1);
}

const readCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const sendEmails = async () => {
  try {
    const emailRows = await readCSVFile(SendMail);
    const recipientRows = await readCSVFile(ReceiveMail);

    for (const emailRow of emailRows) {
      const accountTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailRow.email,
          pass: emailRow.password,
        },
      });

      for (const recipientRow of recipientRows) {
        const mailOptions = {
          from: emailRow.email,
          to: recipientRow.email,
          subject: subject,
          text: context,
        };

        try {
          const info = await accountTransporter.sendMail(mailOptions);
          console.log('Email sent:', info.response);
        } catch (error) {
          console.log('Error:', error);
        }
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }
};

sendEmails();