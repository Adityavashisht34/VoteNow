import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendVerificationEmail =  (to, username, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'VoteNow - Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to VoteNow, ${username}!</h1>
        <p>Thank you for registering. Please verify your email address by entering the following verification code:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0;">${verificationCode}</h2>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `
  };

   transporter.sendMail(mailOptions);
};

export const sendElectionNotification = async (to, electionTitle, startDate) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `New Election: ${electionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Election Announcement</h1>
        <p>A new election has been created:</p>
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin: 0 0 10px 0;">${electionTitle}</h2>
          <p style="margin: 0;">Starts: ${new Date(startDate).toLocaleString()}</p>
        </div>
        <p>Log in to your account to participate in the election.</p>
        <p>Thank you for being a part of our democratic process!</p>
      </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Thank You for Voting!</h1>
        <p>Your vote for "${electionTitle}" has been successfully recorded.</p>
        <p>Results will be available after the election ends.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};