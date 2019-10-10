const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

process.on('unhandledRejection', handleError);

function handleError(err) {
  console.error(err);
  core.setFailed(err.message);
}

async function upload(filePath, context) {
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);

  let { data: uploadAsset } = await octokit.repos.uploadReleaseAsset({
    name: fileName,
    file: file,
    url: context.payload.release.upload_url,
    headers: { "content-length": file.length,
      "content-type": "text/plain"} })
  console.log(`*** Uploaded ${filePath}`);
  console.log("* UPLOAD **********************************************************************");
  console.log(uploadAsset);
}

async function run() {
  const token = core.getInput('github-token', {required: true});
  const octokit = new github.GitHub(token);
  const context = github.context;
  core.setOutput('url', context.payload.release.html_url);
  console.log("* CONTEXT **********************************************************************");
  console.log(context);

  const inputFile = core.getInput('file');
  const inputPattern = core.getInput('pattern');

  if (inputFile != null) {
    upload(inputFile, context);
  }

  if (inputPattern != null) {
    glob(inputPattern, {}, function (er, filePath) {
      upload(filePath, context);
    })
  }
}

run();
