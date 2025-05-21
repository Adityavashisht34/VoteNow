import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail = async (to, username) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to VoteNow - Email Verification',
    html: `
      <h1>Welcome to VoteNow, ${username}!</h1>
      <p>Thank you for registering. Your account has been verified.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendElectionNotification = async (to, electionTitle, startDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `New Election: ${electionTitle}`,
    html: `
      <h1>New Election Announcement</h1>
      <p>A new election "${electionTitle}" has been scheduled.</p>
      <p>Start Date: ${new Date(startDate).toLocaleString()}</p>
      <p>Please login to your account to participate.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendVoteConfirmation = async (to, electionTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Vote Confirmation',
    html: `
      <h1>Thank You for Voting!</h1>
      <p>Your vote for "${electionTitle}" has been successfully recorded.</p>
      <p>Results will be available after the election ends.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};