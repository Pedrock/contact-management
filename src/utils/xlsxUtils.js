import XLSX from 'xlsx';

const reader = new FileReader();

export function getWorkbookFromFile(file) {
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      let binary = '';
      const bytes = new Uint8Array(e.target.result);
      const length = bytes.byteLength;
      for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const workbook = XLSX.read(binary, { type: 'binary', raw: true });

      resolve(workbook);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function getWorksheetColumns(worksheet) {
  return XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 'A1:ZZZ1' })[0];
}
