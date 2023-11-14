const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const process = require('process');
const { getAuthenticatedClient, verifyToken } = require('./modules/auth');
const { listEvents } = require('./modules/listEvents');

app.use(bodyParser.json());

// 이 엔드포인트는 인증된 사용자의 이벤트를 나열합니다.
app.post('/chat', async function(req, res) {
  const messageText = req.body.message.text;
  if (messageText.startsWith('/캘린더조회 ')) {
    const calendarName = messageText.replace('/캘린더조회 ', '').trim();
    try {
      const auth = await getAuthenticatedClient(res);
      console.error("get 함수 실행완료");
      const cid = 'seungwoo@dcamp.kr'; // 또는 req.query.cid 사용
      let day = '2023-11-09'; // 또는 req.query.day 사용
      if(auth.credentials.access_token != undefined){
        const results = await listEvents(auth, cid, day);
        res.json(results); // 결과를 JSON 형식으로 반환
      }
      else {
      console.error(error + ", access token 없음"); // 오류를 콘솔에 기록
      res.json("access token 없음");  
      }
    } catch (error) {
      console.error(error + "인증 실패"); // 오류를 콘솔에 기록
      res.json("인증 실패");
    }
  } else {
    // 기본적으로 메시지를 그대로 반환
    const reply = {text: messageText};
    res.json(reply);
  }
});

// OAuth2 콜백 경로: 사용자가 인증 후 리디렉션되는 경로입니다.
app.get('/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      res.status(400).send('Code is required');
      return;
    }
    const oAuth2Client = await getAuthenticatedClient(); // getAuthenticatedClient 호출 수정
    await verifyToken(oAuth2Client, code); // verifyToken 함수 수정하여 oAuth2Client 인스턴스 전달
    //res.redirect('/chat'); // 인증이 성공하면 /events 경로로 리디렉션합니다.
  } catch (error) {
    console.error(error);
    res.status(500).send('Authentication failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
