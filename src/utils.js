// eslint-disable-next-line import/prefer-default-export
export function getContactFilter(contacts, fieldName) {
  const values = new Set();
  Object.values(contacts).forEach((object) => {
    values.add(object[fieldName]);
  });
  return Array.from(values)
  .map(value => ({ value, text: value }));
}
