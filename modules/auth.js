// From official quickstart at https://developers.google.com/calendar/api/quickstart/nodejs

const fs = require("fs").promises;
const path = require("path");
const process = require("process");
//const { authenticate } = require("@google-cloud/local-auth");
const { OAuth2Client } = require('google-auth-library');
const { google } = require("googleapis");

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

async function checkToken(oAuth2Client, res) {
  // Check if we have previously stored a token.
  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    return getNewToken(oAuth2Client, res); // getNewToken 호출에 res 인자 추가
  }
  
}

function getNewToken(oAuth2Client, res) {
  // Generate a url that asks permissions for the SCOPES
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
// Redirect user to the authUrl or return it as a response
  if (res) {
    console.log(`리다이렉션중: ${authUrl}`);
    res.redirect(authUrl); // Use 'res' for redirection
    console.log(`리다이렉션 완료`);
  } else {
    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    return authUrl; // Or return URL if 'res' is not provided
  }
}

async function verifyToken(oAuth2Client, code) {
  // Verify the code from the query
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  // Store the token to disk for later program executions
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

async function getAuthenticatedClient(res) {
  const credentials = await loadCredentialsFile();
  const oAuth2Client = authorize(credentials);
  await checkToken(oAuth2Client, res);
  return oAuth2Client;
}

module.exports = {
  getAuthenticatedClient,
  verifyToken, // Export this to use in your OAuth2 callback route
};
