import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

interface EmailDetails {
  from: string;
  to: string;
  subject: string;
  body: string;
}

interface SalesOrder {
  [key: string]: any; // Adjust this type to match the actual structure of your sales order
}

// Load credentials from the credentials.json file
const credentials = JSON.parse(fs.readFileSync(path.resolve('credentials.json'), 'utf8'));

// Initialize the OAuth2Client
const oAuth2Client = new OAuth2Client(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uri
);

// Function to validate access token
async function validateAccessToken(oAuth2Client: OAuth2Client): Promise<boolean> {
    try {
      // Ensure access_token is a string by providing a default value or handling appropriately
      const token = oAuth2Client.credentials.access_token ?? '';
  
      // Check if the token is an empty string and handle accordingly
      if (!token) {
        return false;
      }
  
      // Use the access token now that we know it is a string
      await oAuth2Client.getTokenInfo(token);
      return true;
    } catch (error) {
      return false;
    }
  }
 
// Function to refresh access token using the refresh token
async function refreshAccessToken(): Promise<string | null> {
  try {
    const token_url = 'https://oauth2.googleapis.com/token';
    const token_data = new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: credentials.refresh_token,
      grant_type: 'refresh_token',
      redirect_uri: credentials.redirect_uri,
    });

    const response = await fetch(token_url, {
      method: 'POST',
      body: token_data,
    });

    const data = await response.json();
    if (data.access_token) {
      console.log('Access token refreshed');
      credentials.access_token = data.access_token;
      fs.writeFileSync(path.resolve('credentials.json'), JSON.stringify(credentials, null, 2), 'utf8');
      return data.access_token;
    } else {
      console.error('Failed to refresh access token');
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error refreshing access token:', error.message);
    } else {
      console.error('Error refreshing access token:', error);
    }
    return null;
  }
}

// Function to send a reservation confirmation email
async function sendReservationEmail(email: string, name: string, salesOrderNumber: string, arrivalDate: string, departureDate: string) {
  // Set credentials
  oAuth2Client.setCredentials({
    access_token: credentials.access_token, // Access token after successful OAuth flow
    refresh_token: credentials.refresh_token, // Refresh token
  });

  // Validate the access token
  const isAccessTokenValid = await validateAccessToken(oAuth2Client);
  if (!isAccessTokenValid) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      oAuth2Client.setCredentials({
        access_token: newAccessToken,
        refresh_token: credentials.refresh_token,
      });
    } else {
      throw new Error('Could not refresh access token');
    }
  }

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const rawMessage = createRawMessage({
    from: 'office@wausaukeeclub.org',
    to: email,
    subject: 'Reservation Confirmation',
    body: createHTMLBody(name, salesOrderNumber, arrivalDate, departureDate),
  });

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
    },
  });

  return res;
}

function createRawMessage({ from, to, subject, body }: EmailDetails) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset=UTF-8`,  // Ensure the email is sent as HTML
    `\n${body}`,
  ].join('\n');

  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

// Create HTML content for the email body
function createHTMLBody(name: string, salesOrderNumber: string, arrivalDate: string, departureDate: string): string {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #4CAF50;
            text-align: center;
          }
          .details {
            margin: 20px 0;
            font-size: 16px;
            line-height: 1.5;
          }
          .order-number {
            font-weight: bold;
            color: #007BFF;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reservation Confirmation</h1>
          <p>Dear ${name},</p>
          <p>Thank you for your reservation! Here are your reservation details:</p>
          <div class="details">
            <p><strong>Reservation Number:</strong> <span class="order-number">${salesOrderNumber}</span></p>
            <p><strong>Arrival Date:</strong> ${arrivalDate}</p>
            <p><strong>Departure Date:</strong> ${departureDate}</p>
            <p>We look forward to serving you!</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>Wausaukee Club</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Function to send a calendar invite
async function sendCalendarInvite(email: string, arrivalDate: string, departureDate: string) {
  console.log(arrivalDate);
  console.log(departureDate);
  const start = new Date(arrivalDate);
  const end = new Date(departureDate);
  console.log(start);
  console.log(end);
  oAuth2Client.setCredentials({
    access_token: credentials.access_token, // Access token after successful OAuth flow
    refresh_token: credentials.refresh_token, // Refresh token
  });

  // Validate the access token
  const isAccessTokenValid = await validateAccessToken(oAuth2Client);
  if (!isAccessTokenValid) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      oAuth2Client.setCredentials({
        access_token: newAccessToken,
        refresh_token: credentials.refresh_token,
      });
    } else {
      throw new Error('Could not refresh access token');
    }
  }

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  const event = {
    summary: 'Reservation: Arrival and Departure',
    location: 'Your Resort Name or Address',
    description: 'Customer Reservation',
    start: {
      dateTime: start.toISOString(),
      timeZone: 'America/New_York',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: 'America/New_York',
    },
    attendees: [
      { email: email },
    ],
    reminders: {
      useDefault: true,
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all',
  });

  return res.data;
}


// Function to append JSON data to the sales order sheet
async function storeInGoogleSheet(reservationData: object) {
  try {
    // Set credentials
    oAuth2Client.setCredentials({
      access_token: credentials.access_token, 
      refresh_token: credentials.refresh_token, 
    });

    // Validate the access token
    const isAccessTokenValid = await validateAccessToken(oAuth2Client);
    if (!isAccessTokenValid) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        oAuth2Client.setCredentials({
          access_token: newAccessToken,
          refresh_token: credentials.refresh_token,
        });
      } else {
        throw new Error('Could not refresh access token');
      }
    }

    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    // Ensure reservationData is an array of arrays (rows of data)
    const rowData = Array.isArray(reservationData) 
      ? reservationData.map((item: any) => Array.isArray(item) ? item : [item])
      : [];

    if (rowData.length === 0) {
      throw new Error('No valid data to append');
    }

    // Append the rows to the Google Sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: credentials.spreadsheetId,
      range: 'Sheet1', // Make sure this matches the actual sheet name
      valueInputOption: 'RAW',
      requestBody: {
        values: rowData, // Pass the data as rows
      },
    });

    console.log('Data appended to Google Sheet');
    return response.data;
  } catch (error) {
    console.error('Error appending data to Google Sheet:', error);
    throw error;
  }
}


export { storeInGoogleSheet, sendReservationEmail, sendCalendarInvite };
