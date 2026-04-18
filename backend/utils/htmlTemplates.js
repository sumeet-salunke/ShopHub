export const getSuccessHTML = () => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Verified</title>
  </head>
  <body style="margin:0; font-family: Arial; background:#f4f6f8;">
    
    <div style="display:flex; height:100vh; align-items:center; justify-content:center;">
      
      <div style="background:#fff; padding:40px; border-radius:10px; text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.1); max-width:400px;">
        
        <h2 style="color:#28a745;">🎉 Email Verified!</h2>
        
        <p style="color:#555; font-size:15px;">
          Your account has been successfully activated.
        </p>

        <p style="margin-top:20px; font-size:13px; color:#888;">
          You can now login to your account.
        </p>

      </div>

    </div>

  </body>
  </html>
  `;
};

export const getErrorHTML = (message) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Verification Failed</title>
  </head>
  <body style="margin:0; font-family: Arial; background:#f4f6f8;">
    
    <div style="display:flex; height:100vh; align-items:center; justify-content:center;">
      
      <div style="background:#fff; padding:40px; border-radius:10px; text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.1); max-width:400px;">
        
        <h2 style="color:#dc3545;">❌ Verification Failed</h2>
        
        <p style="color:#555; font-size:15px;">
          ${message || "Something went wrong"}
        </p>

        <p style="margin-top:20px; font-size:13px; color:#888;">
          Please request a new verification link.
        </p>

      </div>

    </div>

  </body>
  </html>
  `;
};

export const getOrderSuccessHTML = () => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Order Confirmed</title>
  </head>
  <body style="margin:0; font-family: Arial; background:#f4f6f8;">
    
    <div style="display:flex; height:100vh; align-items:center; justify-content:center;">
      
      <div style="background:#fff; padding:40px; border-radius:10px; text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.1); max-width:400px;">
        
        <h2 style="color:#28a745;">📦 Order Confirmed!</h2>
        
        <p style="color:#555; font-size:15px;">
          Your order has been successfully confirmed and is now being processed.
        </p>

        <p style="margin-top:20px; font-size:13px; color:#888;">
          You can close this window now.
        </p>

      </div>

    </div>

  </body>
  </html>
  `;
};

export const getOrderErrorHTML = (message) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Order Confirmation Failed</title>
  </head>
  <body style="margin:0; font-family: Arial; background:#f4f6f8;">
    
    <div style="display:flex; height:100vh; align-items:center; justify-content:center;">
      
      <div style="background:#fff; padding:40px; border-radius:10px; text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.1); max-width:400px;">
        
        <h2 style="color:#dc3545;">⚠️ Confirmation Failed</h2>
        
        <p style="color:#555; font-size:15px;">
          ${message || "Something went wrong confirming your order"}
        </p>

      </div>

    </div>

  </body>
  </html>
  `;
};