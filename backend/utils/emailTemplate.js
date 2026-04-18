export const getVerifyEmailTemplate = (link, name) => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
      
      <h2 style="color: #1a365d; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h2>
      
      <p style="color: #4a5568; font-size: 16px; margin-bottom: 15px; text-align: left;">
        Hi ${name || "User"},
      </p>
      
      <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px; text-align: left; line-height: 1.5;">
        Thanks for registering! Please verify your email address to get access to all features.
      </p>
      
      <a href="${link}" 
          style="display: inline-block; padding: 14px 32px; 
                font-size: 16px; font-weight: 600; color: #ffffff; background-color: #3182ce; 
                text-decoration: none; border-radius: 8px;">
        Verify Email
      </a>
  
      <p style="margin-top: 30px; font-size: 14px; color: #718096;">
        This link will expire in 24 hours.
      </p>
  
      <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #a0aec0; text-align: left;">
        <p style="margin-bottom: 10px;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <a href="${link}" style="color: #3182ce; word-break: break-all;">${link}</a>
      </div>
  
    </div>
  </div>
  `;
};

export const getOrderConfirmationTemplate = (link, name, amount) => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
      
      <h2 style="color: #ff9900; font-size: 24px; margin-bottom: 20px;">Confirm Your Order</h2>
      
      <p style="color: #4a5568; font-size: 16px; margin-bottom: 15px; text-align: left;">
        Hi ${name || "Shopper"},
      </p>
      
      <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px; text-align: left; line-height: 1.5;">
        Thank you for shopping with us! Please confirm your recent order totaling <strong>₹${amount}</strong> to begin processing.
      </p>
      
      <a href="${link}" 
          style="display: inline-block; padding: 14px 32px; 
                font-size: 16px; font-weight: 600; color: #131921; background-color: #ffd814; 
                text-decoration: none; border-radius: 8px;">
        Confirm Order
      </a>
  
      <p style="margin-top: 30px; font-size: 14px; color: #718096;">
        This order confirmation link will expire soon.
      </p>
  
      <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #a0aec0; text-align: left;">
        <p style="margin-bottom: 10px;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
        <a href="${link}" style="color: #3182ce; word-break: break-all;">${link}</a>
      </div>
  
    </div>
  </div>
  `;
};