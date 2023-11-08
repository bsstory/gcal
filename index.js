const express = require('express');
const app = express();
const process = require('process');
const { authorize } = require("./modules/auth");
const { listEvents } = require("./modules/listEvents");

app.get('/events', async (req, res) => {
  try {
    const auth = await authorize();
    const cid = 'seungwoo@dcamp.kr'; // 또는 req.query.cid 사용
    let day = '2023-11-09'; // 또는 req.query.day 사용
    const results = await listEvents(auth, cid, day);
    res.json(results); // 결과를 JSON 형식으로 반환
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000; // PORT 환경 변수 또는 기본값 3000 사용
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
