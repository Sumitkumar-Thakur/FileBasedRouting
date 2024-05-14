import express from "express";
import fs from "fs";

const app = express();
const ROOT_FOLDER = "./appRoute/";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function handleRegularRoutes(fileUrl, req, res) {
  try {
    console.log("URL", fileUrl);
    const module = await import(fileUrl);
    let data = null;
    const httpVerb = req.method.toLowerCase();
    console.log(httpVerb);
    if (module[httpVerb]) {
      data = module[httpVerb](req, res);
      console.log(
        "dataxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      );
    } else {
      data = module.handler(req, res);
      console.log("datasssssssssssssssssssssssssssssssssssssssssssssssssss");
    }

    return data;
  } catch (e) {
    console.log(e);
    res.statusCode = 404;
    return false;
  }
}

async function handleDynamicRoutes(folder) {
  try {
    const files = await fs.promises.readdir(folder);

    const dynamicFileName = files.find((fname) => {
      return fname.match(/\[[a-zA-Z0-9\._]+\]/);
    });
    console.log(dynamicFileName);
    return {
      file: dynamicFileName,
      param: dynamicFileName.replace("[", "").replace("].js", ""),
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}

app.all("/*", async (req, res) => {
  let fileUrl = (ROOT_FOLDER + req.url).replace("//", "/");
  console.log(fileUrl);

  let isFile = fs.existsSync(fileUrl + ".js");

  if (!isFile) {
    fileUrl += "/index.js";
  } else {
    fileUrl += ".js";
  }

  console.log("fileurl", fileUrl);

  let result = await handleRegularRoutes(fileUrl, req, res);

  if (result === false) {
    //return res.send('Route not found')

    const pathArray = (ROOT_FOLDER + req.url).replace("//", "/").split("/");
    console.log(pathArray);
    const lastElement = pathArray.pop();
    const folderToCheck = pathArray.join("/");
    const dynamicHandler = await handleDynamicRoutes(folderToCheck);

    if (!dynamicHandler) {
      return res.send("Route not found");
    }
    console.log("dynamicHandler", dynamicHandler);
    req.params = { ...req.params, [dynamicHandler.param]: lastElement };
    console.log([folderToCheck, dynamicHandler.file].join("/"));
    console.log(req.params);
    result = await handleRegularRoutes(
      [folderToCheck, dynamicHandler.file].join("/"),
      req,
      res
    );
    console.log(result);

    return res.send(result);
  }
  return res.send(result);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
