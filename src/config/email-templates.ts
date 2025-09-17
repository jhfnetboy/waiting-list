/**
 * Email Templates Configuration
 * 
 * This file contains configurable email templates with HTML and emoji support.
 * You can customize these templates to match your brand and messaging.
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export const EMAIL_TEMPLATES = {
  verification: {
    subject: "🌲 Verify Your Email - Join Our Waiting List",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 10px; overflow: hidden;">
        <div style="background: rgba(255,255,255,0.95); margin: 20px; border-radius: 10px; padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🌲</div>
          <h1 style="color: #2d3748; margin-bottom: 20px; font-size: 28px;">Welcome to Our Waiting List!</h1>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Thank you for joining our exclusive waiting list! Please verify your email address to secure your spot.
          </p>
          
          <div style="background: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin: 30px 0; text-align: left;">
            <p style="color: #2d3748; margin: 0; font-size: 14px;">
              <strong>🔒 Verification Required:</strong> Click the button below to verify your email and activate your position in the waiting list.
            </p>
          </div>
          
          <a href="{{VERIFICATION_LINK}}" style="display: inline-block; background: linear-gradient(135deg, #4299e1, #3182ce); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3); transition: transform 0.2s;">
            ✅ Verify Email Address
          </a>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #4299e1; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
              {{VERIFICATION_LINK}}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #f0fff4; border-radius: 8px; border: 1px solid #9ae6b4;">
            <p style="color: #22543d; margin: 0; font-size: 14px;">
              🚀 <strong>What's Next?</strong> Once verified, you'll receive updates about our launch and exclusive early access opportunities!
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.8);">
          <p style="margin: 0; font-size: 12px;">
            © 2024 Waiting List. This email was sent to {{EMAIL_ADDRESS}}.
          </p>
        </div>
      </div>
    `,
    text: `
🌲 Welcome to Our Waiting List!

Thank you for joining our exclusive waiting list! Please verify your email address to secure your spot.

🔒 Verification Required: Click the link below to verify your email and activate your position in the waiting list.

Verification Link: {{VERIFICATION_LINK}}

🚀 What's Next? Once verified, you'll receive updates about our launch and exclusive early access opportunities!

If you have any questions, please don't hesitate to reach out.

Best regards,
The Waiting List Team

© 2024 Waiting List. This email was sent to {{EMAIL_ADDRESS}}.
    `
  },

  welcome: {
    subject: "🎉 Welcome! You're Now on Our Waiting List",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 0; border-radius: 10px; overflow: hidden;">
        <div style="background: rgba(255,255,255,0.95); margin: 20px; border-radius: 10px; padding: 40px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
          <h1 style="color: #2d3748; margin-bottom: 20px; font-size: 28px;">You're All Set!</h1>
          
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Congratulations! Your email has been verified and you're now officially on our waiting list.
          </p>
          
          <div style="background: #f0fff4; border: 2px solid #68d391; border-radius: 12px; padding: 25px; margin: 30px 0;">
            <div style="font-size: 24px; margin-bottom: 10px;">🎯</div>
            <h2 style="color: #22543d; margin: 0 0 10px 0; font-size: 20px;">Your Position</h2>
            <p style="color: #2f855a; font-size: 32px; font-weight: bold; margin: 0;">#{{POSITION}}</p>
          </div>
          
          <div style="background: #edf2f7; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: left;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px;">🌟 What Happens Next?</h3>
            <ul style="color: #4a5568; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>You'll be among the first to know when we launch</li>
              <li>Receive exclusive early access opportunities</li>
              <li>Get special member benefits and updates</li>
              <li>Join our growing community of early adopters</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fff5f5; border-radius: 8px; border: 1px solid #feb2b2;">
            <p style="color: #742a2a; margin: 0; font-size: 14px;">
              💡 <strong>Pro Tip:</strong> Add us to your contacts to ensure you don't miss any important updates!
            </p>
          </div>
          
          <div style="margin-top: 30px;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Thank you for being part of our journey! 🚀
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.8);">
          <p style="margin: 0; font-size: 12px;">
            © 2024 Waiting List. This email was sent to {{EMAIL_ADDRESS}}.
          </p>
        </div>
      </div>
    `,
    text: `
🎉 You're All Set!

Congratulations! Your email has been verified and you're now officially on our waiting list.

🎯 Your Position: #{{POSITION}}

🌟 What Happens Next?
- You'll be among the first to know when we launch
- Receive exclusive early access opportunities  
- Get special member benefits and updates
- Join our growing community of early adopters

💡 Pro Tip: Add us to your contacts to ensure you don't miss any important updates!

Thank you for being part of our journey! 🚀

Best regards,
The Waiting List Team

© 2024 Waiting List. This email was sent to {{EMAIL_ADDRESS}}.
    `
  }
} as const

export type EmailTemplateType = keyof typeof EMAIL_TEMPLATES

/**
 * Replace template variables with actual values
 */
export function renderEmailTemplate(
  templateType: EmailTemplateType,
  variables: Record<string, string>
): EmailTemplate {
  const template = EMAIL_TEMPLATES[templateType]
  
  let html = template.html
  let text = template.text
  let subject = template.subject
  
  // Replace all variables in the format {{VARIABLE_NAME}}
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    html = html.replace(new RegExp(placeholder, 'g'), value)
    text = text.replace(new RegExp(placeholder, 'g'), value)
    subject = subject.replace(new RegExp(placeholder, 'g'), value)
  }
  
  return { subject, html, text }
}
