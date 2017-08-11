export default function getContactFilter(contacts, fieldName) {
  const values = new Set();
  Object.values(contacts).forEach((object) => {
    values.add(object[fieldName]);
  });
  return Array.from(values)
  .map(value => ({ value, text: value === '' ? '(empty)' : value }));
}
