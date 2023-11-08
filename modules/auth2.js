const express = require('express');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const opn = require('open');
const destroyer = require('server-destroy');

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "credentials", "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials", "credentials.json");

async function authenticate(res) {
  // Load client secrets from a local file.
  const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    const token = JSON.parse(await fs.readFile(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
  } catch (error) {
    // No token found, get a new one
    return getAccessToken(oAuth2Client, res);
  }
  return oAuth2Client;
}

function getAccessToken(oAuth2Client, res) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const server = express()
    .get('/callback', async (req, res) => {
      try {
        const { tokens } = await oAuth2Client.getToken(req.query.code);
        oAuth2Client.setCredentials(tokens);
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
        res.send('Authentication successful! Please return to the console.');
        server.destroy();
      } catch (err) {
        res.send('Error while trying to retrieve access token');
        console.error(err);
      }
    })
    .listen(3000, () => {
      // open the browser to the authorize url to start the workflow
      opn(authUrl, {wait: false}).then(cp => cp.unref());
    });
  destroyer(server);
}

module.exports = {
  authenticate,
};
