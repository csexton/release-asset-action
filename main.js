const core = require('@actions/core');
const fs = require('fs');
const github = require('@actions/github');
const glob = require('glob');
const mime = require('mime-types')
const path = require('path');

process.on('unhandledRejection', (err) => {
  core.error(err);
  core.setFailed(err.message);
});

function tap (value, fn) {
  fn(value);
  return value;
}

async function uploadMultiple(fileList, context, octokit) {
  for (let file of fileList) {
    upload(file, context, octokit);
  }
}

async function upload(filePath, context, octokit) {
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);
  let mimeType = mime.lookup(fileName) || 'application/octet-stream';

  console.log(`Uploading file: ${filePath}`);

  try {
  let response  = await octokit.repos.uploadReleaseAsset({
    name: fileName,
    file: file,
    url: context.payload.release.upload_url,
    headers: {
      "content-length": file.length,
      "content-type": mimeType
    }
  });
  } catch (error) {
    console.log("* ERROR ************************************************************************");
    console.dir(error);
    console.log("* RESPONSE *********************************************************************");
    console.dir(response);
    console.log("********************************************************************************");
    core.error(`Upload failed: ${error}`);
    core.setFailed(err.message);
  }
  console.log(`Uploaded ${fileName}`);
}

async function run() {
  const token = core.getInput('github-token', {required: true});
  const octokit = new github.GitHub(token);
  const context = github.context;
  core.setOutput('url', context.payload.release.html_url);

  if (! context.payload.release) {
    core.warning("Not running action as a release, skipping.");
  }

  var list = [];

  // Add any single files
  list = list.concat(core.getInput('file'))

  // Get list of new-line-seperated files
  if (core.getInput('files')) {
    list = list.concat(core.getInput('files').split(/\r?\n/))
  }

  // Get glob pattern of files
  if (core.getInput('pattern')) {
    glob(core.getInput('pattern'), {}, (er, matches) => {
      list = list.concat(matches)
    });
  }

  // Clean up list by removing any non-truthy values
  list = list.filter(n => n);

  // Upload
  uploadMultiple(list, context, octokit);

}

run();
