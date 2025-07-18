# Email Setup for DeSpy AI

## Required Environment Variables

You need to add these environment variables to your Railway project:

### For Gmail SMTP:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### For Outlook/Hotmail SMTP:
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### For SendGrid:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## How to Set Up:

1. Go to your Railway dashboard
2. Select your DeSpy AI backend project
3. Go to "Variables" tab
4. Add the above environment variables
5. Redeploy the service

## Gmail App Password Setup:

If using Gmail:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password as SMTP_PASS

## Testing:

After setup, try joining the waitlist at https://despy.io and check if you receive a welcome email.

## Troubleshooting:

- Check Railway logs for email errors
- Verify SMTP credentials are correct
- Ensure the email service is not blocked by your provider 