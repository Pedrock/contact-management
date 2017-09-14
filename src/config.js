const _ = require('lodash');

const csvSeparator = ';';
exports.csvSeparator = csvSeparator;

const contactsColumns = [
  {
    name: 'ID',
    csv: 'ID',
    required: true,
  },
  {
    name: 'Name',
    csv: 'Name',
    hidden: true,
    exportTarget: true,
  },
  {
    name: 'Given Name',
    csv: 'Given Name',
    required: true,
    exportTarget: true,
  },
  {
    name: 'Additional Name',
    csv: 'Additional Name',
    exportTarget: true,
  },
  {
    name: 'Family Name',
    csv: 'Family Name',
    required: true,
    exportTarget: true,
  },
  {
    name: 'Location',
    csv: 'Location',
    required: true,
  },
  {
    name: 'City',
    csv: 'City',
    required: true,
  },
  {
    csv: 'Phone 1 - Type',
    constant: 'Mobile',
    exportTarget: true,
  },
  {
    name: 'Mobile',
    csv: 'Phone 1 - Value',
    type: 'phone',
    exportTarget: true,
  },
  {
    csv: 'Phone 2 - Type',
    constant: 'Mobile',
    exportTarget: true,
  },
  {
    name: 'Mobile 2',
    csv: 'Phone 2 - Value',
    type: 'phone',
    exportTarget: true,
  },
  {
    csv: 'Phone 3 - Type',
    constant: 'Home',
    exportTarget: true,
  },
  {
    name: 'Home Phone',
    csv: 'Phone 3 - Value',
    type: 'phone',
    exportTarget: true,
  },
  {
    name: 'Gender',
    csv: 'Gender',
    required: true,
    choices: [
    { label: 'male', value: 'male' },
    { label: 'female', value: 'female' },
    ],
  },
  {
    name: 'Blacklisted',
    type: 'boolean',
  },
];
exports.contactsColumns = contactsColumns;

exports.phoneNumberFields = contactsColumns.filter(f => f.type === 'phone').map(f => f.name);

exports.order = _.map(contactsColumns, col => col.name);

exports.baseContact = contactsColumns
  .filter(col => col.name)
  .reduce((obj, col) => ({ ...obj, [col.name]: col.constant || '' }), {});

const phoneRegex = new RegExp('^((00|\\+)351)?[0-9]{9}$');

exports.validatePhoneNumber = function validatePhoneNumber(number) {
  return phoneRegex.test(String(number).replace(/ /g, ''));
};

