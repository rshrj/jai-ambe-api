const scheduler = require('node-schedule');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Upload = require('../../models/Upload');
const {uploadsFolder, deletesFolder} = require('./checkUploadFolder');

const delay = parseInt(process.env.DELETE_DELAY || '30');

const safetyOn = process.env.SAFETYON || true;

const deleteFile = (imagePath) => safetyOn ? fs.renameSync(imagePath, path.join(deletesFolder, imagePath.split('/').pop())) : fs.unlinkSync(imagePath);

const scheduleDelete = (uploadId) => {
  //Calculating 30 min later time.
  let date = new Date();
  date.setMinutes(date.getMinutes() + delay);

  //Node Scheduler
  return scheduler.scheduleJob(
    date,
    async function (id) {
      const upload = await Upload.findById(id);

      if (upload.attached) {
        return;
      }

      //if file is not used in any listings then delete it from Upload collection & public/uploaded folder.
      try {
        await Upload.findByIdAndDelete(id);
      } catch (err) {
        console.log(`Error while doing a scheduled delete: ${err}`);
      }

      const filename = upload.path.split('/').pop();

      const imagePath = path.join(
        uploadsFolder,
        filename
      );

      if (fs.existsSync(imagePath)) {
        console.log(`${filename} not attached for ${delay} minutes, deleting it...`);
        deleteFile(imagePath);
      }
    }.bind(null, uploadId)
  );
};


const deleteStrayUploads = async () =>
  scheduler.scheduleJob(`*/${delay} * * * *`, async function () {
    try {
      //Reading all files in public/uploaded folder.
      const currentFiles = fs.readdirSync(uploadsFolder);

      //Fetching all images's path in Upload collection.
      const validUploads = (await Upload.find({ attached: true })).map(
        (upload) => upload.path.split('/').pop()
      );

      const filesToDelete = _.difference(currentFiles, validUploads);

      if (_.isEmpty(filesToDelete)) {
        return;
      }

      console.log(`${filesToDelete.length} stray files found, deleting...`)
      console.log(`${filesToDelete.join('\n')}`);

      filesToDelete.map(fileToDelete => deleteFile(path.join(uploadsFolder, fileToDelete)));

      await Upload.findAndDelete({ attached: false });

    } catch (err) {
      console.log(err);
    }
  });

module.exports = { scheduleDelete, deleteStrayUploads };
