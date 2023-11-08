// listEvents.js 수정된 버전

const { google } = require("googleapis");

function formatDate(isoStr) {
  if (!isoStr) {
    return 'All Day'; // 'start' 값이 없는 경우 'All Day'로 표시합니다.
  }
  const date = new Date(isoStr);
  if (isNaN(date)) {
    return 'Invalid date'; // 날짜 파싱이 실패한 경우 'Invalid date'를 반환합니다.
  }
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Lists the events on a given calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} calendarId The calendar id to list events from.
 * @param {string} day The day to list events (in the format YYYY-MM-DD).
 * @returns {Promise<Array>} A promise that resolves to an array of event objects.
 */
async function listEvents(auth, calendarId, day) {
  const calendar = google.calendar({ version: "v3", auth });
  let timeMin = new Date(day);
  timeMin.setHours(0, 0, 0, 0); // start of the day
  let timeMax = new Date(day);
  timeMax.setHours(23, 59, 59, 999); // end of the day

  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;

  if (!events || events.length === 0) {
    return []; // 빈 배열을 반환합니다.
  }

  // 이벤트 데이터를 포맷팅하여 배열로 변환
  const eventList = events.map((event) => {
    const start = event.start.dateTime || event.start.date;
    const formattedStart = start ? formatDate(start) : 'All Day';
    return `${event.summary} (${formattedStart})`;
  });

  return eventList; // 포맷팅된 이벤트 목록을 반환합니다.
}

module.exports = {
  listEvents,
};
