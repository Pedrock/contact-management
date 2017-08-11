import _ from 'lodash';

export const csvSeparator = ';';

export const contactsColumns = [
  {
    name: 'ID',
    required: true,
  },
  {
    name: 'Name',
    csv: 'Name',
    hidden: true,
  },
  {
    name: 'Given Name',
    csv: 'Given Name',
    required: true,
  },
  {
    name: 'Additional Name',
    csv: 'Additional Name',
  },
  {
    name: 'Family Name',
    csv: 'Family Name',
    required: true,
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
  },
  {
    name: 'Mobile',
    csv: 'Phone 1 - Value',
    type: 'phone',
  },
  {
    csv: 'Phone 2 - Type',
    constant: 'Mobile',
  },
  {
    name: 'Mobile 2',
    csv: 'Phone 2 - Value',
    type: 'phone',
  },
  {
    csv: 'Phone 3 - Type',
    constant: 'Home',
  },
  {
    name: 'Home Phone',
    csv: 'Phone 3 - Value',
    type: 'phone',
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

export const phoneNumberFields = contactsColumns.filter(f => f.type === 'phone').map(f => f.name);

export const order = _.map(contactsColumns, col => col.name);

export const baseContact = contactsColumns
  .filter(col => col.name)
  .reduce((obj, col) => ({ ...obj, [col.name]: col.constant || '' }), {});

const phoneRegex = new RegExp('^((00|\\+)351)?[0-9]{9}$');

export function validatePhoneNumber(number) {
  return phoneRegex.test(String(number).replace(/ /g, ''));
}
