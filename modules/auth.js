const fs = require('fs').promises;
const { google } = require('googleapis');
const path = require('path');
const process = require('process');
const { OAuth2Client } = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'credentials', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials', 'credentials.json');

async function loadCredentialsFile() {
  const content = await fs.readFile(CREDENTIALS_PATH);
  return JSON.parse(content);
}

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  return oAuth2Client;
}

async function checkToken(oAuth2Client) {
  // Check if we have previously stored a token.
  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return getNewToken(oAuth2Client); // getNewToken will handle the user authorization flow
  }
}

function getNewToken(oAuth2Client) {
  // Generate a url that asks permissions for the SCOPES
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  // Your code to redirect user to the authUrl
}

async function verifyToken(oAuth2Client, code) {
  // Verify the code from the query
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  // Store the token to disk for later program executions
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

async function getAuthenticatedClient() {
  const credentials = await loadCredentialsFile();
  const oAuth2Client = authorize(credentials);
  await checkToken(oAuth2Client);
  return oAuth2Client;
}

module.exports = {
  getAuthenticatedClient,
  verifyToken, // Export this to use in your OAuth2 callback route
};
