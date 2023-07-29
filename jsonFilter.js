import fs from 'fs';
import path from 'path';

const studentTest = fs.readFileSync(path.resolve('src/unfiltered-tests-of-student.json'), 'utf-8');
const exampleTest = fs.readFileSync(path.resolve('src/unfiltered-tests-example.json'), 'utf-8');
const destination = 'results';

const initialJson = JSON.parse(studentTest);

const filteredRequests = Object
  .entries(initialJson)[0][1]
  .entries
  .filter(
    (x) => {
      if (
        x.request.method === 'POST'
        && x.request.url.includes('exercises')
      ) return true;
      return false;
    },
  )
  .map((x) => (
    {
      request: {
        method: x.request.method,
        url: x.request.url,
        body: x.request.postData.text,
      },
      response: {
        status: x.response.status,
        content: x.response.content.text,
      },
    }
  ));
await fs.writeFile(
  `${destination}/filtered-json.json`,
  JSON.stringify(filteredRequests),
  (err) => { if (err !== null) console.log(err); },
);
