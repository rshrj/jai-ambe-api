const { format } = require('date-fns');
const date = new Date();

console.log(format(date, 'dd/MM/yyyy KK:mm:ss a'))