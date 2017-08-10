// Source: https://github.com/martindrapeau/csvjson-app/blob/master/js/csvjson/csv2json.js
import _ from 'lodash';

const separators = [',', ';', '\t'];
const errorDetectingSeparator = new Error('Separator could not be detected.');
const errorEmpty = new Error('Empty input.');
const errorEmptyHeader = new Error('Could not detect header. Ensure first row contains your column headers.');

function detectSeparator(csv) {
  const counts = {};
  let sepMax = null;
  separators.forEach((sep) => {
    const re = new RegExp(sep, 'g');
    counts[sep] = (csv.match(re) || []).length;
    sepMax = !sepMax || counts[sep] > counts[sepMax] ? sep : sepMax;
  });
  return sepMax;
}

function CSVtoArray(strData, strDelimiter = ',') {
  // Create a regular expression to parse the CSV values.
  const objPattern = new RegExp(
    (
      // Delimiters.
      `(\\${strDelimiter}|\\r?\\n|\\r|^)` +

      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +

      // Standard fields.
      `([^\\${strDelimiter}\\r\\n]*))`
    ),
    'gi',
  );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  const arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  // eslint-disable-next-line no-cond-assign
  while (arrMatches = objPattern.exec(strData)) {
    // Get the delimiter that was found.
    const strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    let strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp('""', 'g'),
        '"',
      );
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}

export default function csvToJson(csv, options = {}) {
  if (csv.length === 0) throw errorEmpty;

  const separator = options.separator || detectSeparator(csv);
  if (!separator) throw errorDetectingSeparator;

  const arr = CSVtoArray(csv, separator);
  if (!arr) throw errorEmpty;

  const keys = arr.shift().map(key => _(key).trim().trim('"'));
  if (keys.length === 0) throw errorEmptyHeader;

  const json = options.hash ? {} : [];
  for (let l = 0; l < arr.length; l++) {
    const row = {};
    let hashKey;
    for (let i = 0; i < keys.length; i++) {
      const value = _(arr[l][i]).trim().trim('"');
      const number = value === '' ? NaN : value - 0;
      if (options.hash && i === 0) {
        hashKey = value;
      } else {
        row[keys[i]] = isNaN(number) || !options.parseNumbers ? value : number;
      }
    }
    if (options.hash) { json[hashKey] = row; } else { json.push(row); }
  }

  return json;
}
