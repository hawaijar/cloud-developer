import express from 'express';
import bodyParser from 'body-parser';
import { isURL } from "validator"
import fs from "fs";
import path from "path";
import { filterImageFromURL, deleteLocalFiles } from './util/util';
import { pathToFileURL } from 'url';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  app.get('/filteredimage', async (req, res) => {
    const { image_url } = req.query;
    if (!image_url || !isURL(image_url)) {
      res.status(400).send(`Malformed query (image_url invalid or/and missing)...`)
    }
    try {
      filterImageFromURL(image_url).then(filteredpath => {
        res.status(200).sendFile(filteredpath)
      });
    }
    catch (e) {
      res.status(400).send(`Procesing image failed...`)
    }

  });

  app.delete('/images', async (req, res) => {
    // get all the files from __dirname/util/tmp/filtered*.jpg
    try {
      let files: string[] = [];

      fs.readdirSync(path.join(__dirname, '/util/tmp')).forEach(filename => {
        if (filename.startsWith('filtered') && filename.endsWith('jpg')) {
          files.push(path.join(__dirname, '/util/tmp/' + filename))
        }
      });
      deleteLocalFiles(files);
      res.status(200).send(`Files deleted successfully`)
    }
    catch (e) {
      res.status(400).send(`Error occured while deleting the files`)
    }
  });

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();