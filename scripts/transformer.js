const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { contactsColumns } = require('../src/config');
const fixNames = require('../src/utils/fixNames');

const config = {
  encoding: 'latin1',
  firstLineIndex: 1,
  inputColumns: [
    'Name',
    'Mobile',
  ],
  outputColumns: [
    'Name',
    'Given Name',
    'Additional Name',
    'Family Name',
    'Phone 1 - Type',
    'Phone 1 - Value',
  ],
};

const inputDir = process.argv[2];
const outputDir = process.argv[3];

function generateFile(filename) {
  const outputColumns = contactsColumns.filter(col => config.outputColumns.includes(col.csv));

  const inputFile = path.join(inputDir, filename);
  let file = fs.readFileSync(inputFile, config.encoding);
  if (typeof file === 'string') {
    file = Buffer.from(file.replace(/;/g, ','), config.encoding);
  }

  const wb = XLSX.read(file);
  const worksheet = wb.Sheets[wb.SheetNames[0]];

  const rawContacts = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const contacts = rawContacts.reduce((arr, contact, contactIndex) => {
    if (contactIndex < config.firstLineIndex) return arr;
    return [...arr, config.inputColumns.reduce((obj, colName, colIndex) =>
      ({ ...obj, [colName]: contact[colIndex] }), {})];
  }, []);

  const invalidPhoneNumbers = [];
  fixNames(contacts, invalidPhoneNumbers);

  const header = outputColumns.map(col => col.csv);

  const rows = contacts.map(contact =>
    outputColumns.map(col => contact[col.name] || col.constant));

  const data = `${header.join(';')}\n${rows.map(row => row.join(';')).join('\n')}`;
  const outputFile = path.join(outputDir, `out_${filename}`);
  fs.writeFileSync(outputFile, data);
}

fs.readdirSync(inputDir).forEach(generateFile);
