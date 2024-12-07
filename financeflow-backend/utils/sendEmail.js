// utils/sendEmail.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const logger = require('./logger'); // Import the logger

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail's SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error(`Error configuring email transporter: ${error}`);
  } else {
    logger.info('Email transporter is configured correctly.');
  }
});

/**
 * Sends an email using a Handlebars template.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Subject of the email.
 * @param {string} templateName - Name of the Handlebars template (without extension).
 * @param {object} context - Dynamic data to inject into the template.
 */
const sendEmail = async (to, subject, templateName, context) => {
  try {
    // Read the template file
    const templatePath = path.join(__dirname, '..', 'views', `${templateName}.handlebars`);
    const source = fs.readFileSync(templatePath, 'utf8');

    // Compile the template
    const template = handlebars.compile(source);

    // Generate the HTML
    const html = template(context);

    // Define mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html, // Use the compiled HTML
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to} with subject "${subject}" using template "${templateName}"`);
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw new Error('Email sending failed');
  }
};

module.exports = sendEmail;
