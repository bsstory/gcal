const process = require("process");
const { authorize } = require("./modules/auth");
const { listEvents } = require("./modules/listEvents");

/*
function _addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
*/

(async () => {
  const auth = await authorize();
  const cid = 'seungwoo@dcamp.kr'; //process.argv[2];
  let day = '2023-11-09'; // process.argv[3];
  //const end = process.argv[4];

  console.log(`Result ${cid} : ${day}`);
  const Result = await listEvents(auth, cid, day);
  console.log(Result);


})();
