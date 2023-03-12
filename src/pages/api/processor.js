// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import formidable from "formidable";
import fs from 'fs'
import csvtojson from 'csvtojson'
import jszip from 'jszip'

async function saveFormData(fields, files, res) {
  // save to persistent data store
  // console.log(fields)
  console.log()
  const zip = new jszip();

  const keys = Object.keys(files)

  for(const key of keys) {
    const { filepath, originalFilename } = files[key]
    

    // using the readFileSync() function
    // and passing the path to the file
    // console.log("Here1")
    const buffer = fs.readFileSync(filepath);
    // console.log("Here2")
    // console.log(filepath, originalFilename)
    // use the toString() method to convert
    // Buffer into String
    const fileContent = buffer.toString();
    
    const json = JSON.stringify(await csvtojson({ delimiter: ";" }).fromString(fileContent))
    // console.log(json);
    // console.log(json)
    
    zip.file(originalFilename.replace("csv", "json"), json, {binary: false})
  }

  res.setHeader('Content-Disposition', 'attachment; filename=output.zip');
  res.setHeader('Content-Type', 'application/zip');

  zip
    .generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(res)

   
  // res.writeHead(200, { 
  //   'Content-Type': 'application/zip',  
  //   'Content-Disposition': 'attachment; filename=output.zip'
  // });
  // stream.on('data', data => res.send(data));
  // stream.on('close', () => {
  //   res.end()
  //   console.log("doneee")
  // });

}

async function handlePostFormReq(req, res) {
  const form = formidable({ multiples: true });

  // form.on('file', (formname, file) => {
  //   // same as fileBegin, except
  //   // it is too late to change file.filepath
  //   // file.hash is available if options.hash was used
  //   console.log(file.toString())
  // });

  const formData = new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject("error");
      }
      // console.log(files)
      // console.log(files.upload.path)
      resolve({ fields, files });
    });
  });

  try {
    const { fields, files } = await formData;
    // const isValid = await validateFromData(fields, files);
    // if (!isValid) throw Error("invalid form schema");

    try {
      await saveFormData(fields, files, res);
      console.log("Zip file sent alhamdulilah!!!")
      // res.status(200).send({ status: "submitted" });
      return;
    } catch (e) {
      console.log(e)
      res.status(500).send({ status: "something went wrong" });
      return;
    }
  } catch (e) {
    console.log(e)
    res.status(400).send({ status: "invalid submission" });
    return;
  }
}

export default async function handler(req, res) {
  if (req.method == "POST") {
    await handlePostFormReq(req, res);
  } else {
    res.status(404).send("method not found");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
