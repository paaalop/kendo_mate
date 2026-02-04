const XLSX = require('xlsx');
const workbook = XLSX.readFile('docs/kendo_test_dataset.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log(jsonData[0]);
