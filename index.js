const express = require('express');
const app = express();
const process = require('process');
const { getAuthenticatedClient, verifyToken } = require('./modules/auth');
const { listEvents } = require('./modules/listEvents');

// 이 엔드포인트는 인증된 사용자의 이벤트를 나열합니다.
app.get('/events', async (req, res) => {
  try {
    const auth = await getAuthenticatedClient();
    const cid = 'seungwoo@dcamp.kr'; // 또는 req.query.cid 사용
    let day = '2023-11-09'; // 또는 req.query.day 사용
    const results = await listEvents(auth, cid, day);
    res.json(results); // 결과를 JSON 형식으로 반환
  } catch (error) {
    console.error(error); // 오류를 콘솔에 기록
    res.status(500).send('Internal Server Error');
  }
});

// OAuth2 콜백 경로: 사용자가 인증 후 리디렉션되는 경로입니다.
app.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    await verifyToken(code); // 인증 코드를 검증하고 토큰을 저장합니다.
    res.redirect('/events'); // 인증이 성공하면 /events 경로로 리디렉션합니다.
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
