const scheduler = require('node-schedule');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const Upload = require('../../models/Upload');
const Listing = require('../../models/Listing');

const uploadDirectory = path.join(__dirname, '..', '..', 'public', 'uploaded');

// TODO: write a function scheduleDelete(_id) that creates a new Node-schedule job to delete an Upload with _id (both the mongoDB record and the file from public/uploads/)

// TODO: write another function deleteStrayUploads() that scans through /public/uploads to find any files that do not have an Upload record and deletes them

const scheduleDelete = (uploadId) => {
   
  //Calculating 30 min later time.
  let date = new Date();
  date.setMinutes(date.getMinutes() + 30);
   
  //Node Scheduler
  const job = scheduler.scheduleJob(
    date,
    async function (id) {
        
      const upload = await Upload.findById(id);

      if (!upload.attached) {
        //if file is not used in any listings then delete it from Upload collection & public/uploaded folder.
        await Upload.findByIdAndDelete(id);

        const imagePath = path.join(
          uploadDirectory,
          upload.path.split('/').pop()
        );

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    }.bind(null, uploadId)
  );
};

const deleteStrayUploads = async () => {
  
  const job = scheduler.scheduleJob('*/30 * * * *', async function () {
    try {
      //Reading all files in public/uploaded folder.
      const files = fs.readdirSync(uploadDirectory);
     
      //Fetching all images's path in Upload collection.
      const allUploads = await Upload.find({}, '-_id path');
      

      if (files.length > 0) {
        let allImages = [];
        if (allUploads.length > 0) {
          allImages = allUploads.map((u) => u.path.split('/').pop());
        }
       
        const imagesToDelete = _.difference(files, allImages);
      

        if (imagesToDelete.length > 0) {
          imagesToDelete.forEach((image) => {
            let deleteImagePath = uploadDirectory + '/' + image;
            try {
              if (fs.existsSync(deleteImagePath)) {
                fs.unlinkSync(deleteImagePath);
              }
           
            } catch (err) {
              console.log(err);
              //TODO: Some kind of email alert or logger needed here.
            }
          });
        }
      }
    } catch (err) {
      console.log(err);
      //TODO: Some kind of email alert or logger needed here.
    }
  });
};

module.exports = { scheduleDelete, deleteStrayUploads };
