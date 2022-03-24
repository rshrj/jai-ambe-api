const path = require('path');
const fs = require('fs');

// To check & create uploaded folder in public folder in root directory .
let publicFolder = path.join(__dirname, '..', '..', 'public');

if (!fs.existsSync(publicFolder)) {
  fs.mkdirSync(publicFolder);
}
const uploadsFolder = path.join(publicFolder, 'uploaded');

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

const deletesFolder = path.join(publicFolder, 'deleted');

if (!fs.existsSync(deletesFolder)) {
  fs.mkdirSync(deletesFolder);
}

module.exports = {uploadsFolder, deletesFolder};
