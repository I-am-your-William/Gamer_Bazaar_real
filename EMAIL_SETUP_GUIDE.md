# Gmail Email Setup Guide

To enable order confirmation emails with serial numbers and security QR codes, follow these steps:

## 1. Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account (required for app passwords)
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. Click on "Security" in the left sidebar
4. Under "Signing in to Google", click on "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Enter "Gamer Bazaar Store" as the custom name
7. Click "Generate" - copy the 16-character password

## 2. Configure Environment Variables

Add these secrets in your Replit project:

- **EMAIL_USER**: Your Gmail address (e.g., youremail@gmail.com)
- **EMAIL_PASS**: The 16-character app password from step 1
- **EMAIL_HOST**: smtp.gmail.com (optional, defaults to Gmail)
- **EMAIL_PORT**: 587 (optional, defaults to Gmail)

## 3. Test the System

1. Add items to cart and complete checkout
2. Check server logs for email confirmation
3. If configured properly, emails will be sent to customer addresses
4. If not configured, detailed email content will be logged to console

## Email Features

✅ **Professional HTML emails** with gaming theme
✅ **Order details** with customer information
✅ **Serial numbers** for each product
✅ **QR code images** attached for verification
✅ **Automatic inventory assignment** (available → sold)
✅ **Fallback logging** if email service unavailable

## Security Notes

- App passwords are safer than your main Gmail password
- Never share your app password
- You can revoke app passwords anytime in Google settings
- Emails are sent from your Gmail account with professional branding

## Troubleshooting

- **"Invalid credentials"**: Check EMAIL_USER and EMAIL_PASS
- **"Connection failed"**: Verify 2FA is enabled and app password is correct
- **No emails sent**: Check console logs for fallback mode
- **Missing QR codes**: Ensure inventory units have security code images uploaded