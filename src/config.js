import _ from 'lodash';

export const csvSeparator = ';';

export const contactsColumns = [
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
    required: true,
  },
  {
    name: 'Phone 1',
    csv: 'Phone 1 - Value',
    required: true,
  },
  {
    csv: 'Phone 2 - Type',
    constant: 'Mobile',
  },
  {
    name: 'Phone 2',
    csv: 'Phone 2 - Value',
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
];

export const order = _.map(contactsColumns, col => col.name);

export const baseContact = contactsColumns
  .filter(col => col.name)
  .reduce((obj, col) => ({ ...obj, [col.name]: col.constant || '' }), {});
