import fs from 'fs';
import path from 'path';

const resultsDirectory = 'results';
const srcDirectory = 'src';
const srcFileDict = fs
  .readdirSync(srcDirectory)
  .filter((x) => (['json', 'har'].includes(x.substring(x.lastIndexOf('.') + 1))))
  .map((fileName) => (
    {
      fileName,
      fileData: fs.readFileSync(path.resolve(`${srcDirectory}/${fileName}`), 'utf-8'),
    }
  ));

const filterFccExercisesData = async (data) => {
  const parsedObject = JSON.parse(data);

  const filteredData = Object
    .entries(parsedObject)[0][1]
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
  return filteredData;
};
const filterFccLogsData = async (data) => {
  const parsedObject = JSON.parse(data);

  const filteredData = Object
    .entries(parsedObject)[0][1]
    .entries
    .filter(
      (x) => {
        if (
          x.request.method === 'GET'
          // && x.request.url.includes('logs')
        ) return true;
        return false;
      },
    )
    .map((x) => (
      {
        request: {
          method: x.request.method,
          url: x.request.url,
        },
        response: {
          status: x.response.status,
          content: x.response.content.text,
        },
      }
    ));
  return filteredData;
};

const recordFile = async (data, fileName) => {
  await fs.writeFile(
    `${resultsDirectory}/${fileName}`,
    JSON.stringify(data),
    (err) => { if (err !== null) console.log(err); },
  );
};

const filterData = ((filterFunc, purpose) => {
  srcFileDict.forEach(({ fileName, fileData }) => {
    filterFunc(fileData)
      .then((result) => {
        const resultFileNameEnding = `${fileName.substring(0, fileName.lastIndexOf('.'))}.json`;
        const resultFileName = `filtered-for-${purpose}-${resultFileNameEnding}`;
        recordFile(result, resultFileName);
      });
  });
});

try {
  filterData(filterFccLogsData, 'logs');
  console.log('Data filtered!');
} catch (err) {
  console.log(err);
}
