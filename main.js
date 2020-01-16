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

async function uploadMultiple(fileList, context, octokit, url) {
  for (let file of fileList) {
    upload(file, context, octokit, url);
  }
}

async function upload(filePath, context, octokit, url) {
  filePath = filePath.trim();
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);
  let mimeType = mime.lookup(fileName) || 'application/octet-stream';

  console.log(`Uploading file: ${filePath}`);

  try {
    let response  = await octokit.repos.uploadReleaseAsset({
      name: fileName,
      file: file,
      url: url,
      headers: {
        "content-length": file.length,
        "content-type": mimeType
      }
    });
  } catch (error) {
    core.setFailed(`Upload failed: ${error.message} ${JSON.stringify(error.errors)}`);
  }
  console.log(`Uploaded ${fileName}`);
}

async function run() {
  const token = core.getInput('github-token', {required: true});
  const octokit = new github.GitHub(token);
  const context = github.context;

  let url;
  if (! context.payload.release) {
      url = core.getInput('release-url', {required: false});
      if(url){
        core.error("U need to provide an url if the action does not run on a release!");
        process.exit(1);
      }
  }else{
      url= core.getInput('release-url', {required: false}) || context.payload.release.html_url;
  }

  core.setOutput('url', url );

  var list = [];

  // Add any single files
  list = list.concat(core.getInput('file'))

  // Get list of new-line-seperated files
  if (core.getInput('files')) {
    list = list.concat(core.getInput('files').split(/\r?\n/))
  }

  // Get glob pattern of files
  if (core.getInput('pattern')) {
    list = list.concat(glob.sync(core.getInput('pattern')));
  }

  // Clean up list by removing any non-truthy values
  list = list.filter(n => n);

  // Upload the lot of 'em
  uploadMultiple(list, context, octokit, url);
}

run();
