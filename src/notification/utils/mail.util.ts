export function getEmailHtml(body: string) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header img,
        .header h1 {
          display: inline-block;
          vertical-align: middle;
        }
        .header img {
          max-width: 50px;
          height: auto;
          margin-right: 10px;
        }
        .header h1 {
          font-size: 24px;
          margin: 10px 0;
          color: #333333;
        }
        .content {
          font-size: 16px;
          line-height: 1.6;
          color: #333333;
        }
        .verify-button {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 10px;
          background-color: #7386C3;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          font-size: 14px;
          color: #777777;
          text-align: center;
        }
        .footer a {
          color: #4caf50;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nest Demo.</h1>
        </div>
        <div class="content">
          ${body}  
          <p>
            If you have any questions about this email or need assistance with our
            services, please don't hesitate to contact us at
            <a href="tel:+251xxxxxxxx">+251-xxx-xxx-xxxx</a> or visit our website at
            <a href="https://www.hopeuptech.com/"
              >https://www.nestdemo.com/</a
            >.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Nest Demo. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>`;
}
