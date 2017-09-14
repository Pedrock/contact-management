const _ = require('lodash');
const getGender = require('../utils/getGender');
const { phoneNumberFields, validatePhoneNumber } = require('../config');

/* eslint-disable no-param-reassign */
module.exports = function fixNames(contacts, invalidPhoneNumbers) {
  contacts.forEach((contact) => {
    contact.Name = _.startCase(_.toLower(contact.Name || ''));
    contact.Location = _.startCase(_.toLower(contact.Location || ''));
    const nameParts = (contact.Name).split(' ');
    if (!contact['Given Name']) {
      contact['Given Name'] = nameParts.length > 0 ? nameParts[0] : '';
    }
    if (!contact['Family Name']) {
      contact['Family Name'] = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    }
    if (!contact['Additional Name']) {
      contact['Additional Name'] = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
    }
    if (!contact.Gender) {
      contact.Gender = getGender(contact['Given Name']);
    }
    phoneNumberFields.forEach((field) => {
      if (contact[field] && !validatePhoneNumber(contact[field])) {
        if (!invalidPhoneNumbers.includes(contact[field])) {
          invalidPhoneNumbers.push(contact[field]);
        }
        contact[field] = '';
      }
    });
    if (contact['Mobile 2'] && !contact.Mobile) {
      contact.Mobile = contact['Mobile 2'];
      contact['Mobile 2'] = '';
    }
    contact.Blacklisted = contact.Blacklisted && contact.Blacklisted.toLowerCase() !== 'x';
    delete contact[''];
  });
};
/* eslint-enable no-param-reassign */
