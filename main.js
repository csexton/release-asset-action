const core = require('@actions/core');
const fs = require('fs');
const github = require('@actions/github');
const glob = require("glob");
const path = require('path');

process.on('unhandledRejection', handleError);

function handleError(err) {
  console.error(err);
  core.setFailed(err.message);
}

async function upload(filePath, context, octokit) {
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);

  let { data: uploadAsset } = await octokit.repos.uploadReleaseAsset({
    name: fileName,
    file: file,
    url: context.payload.release.upload_url,
    headers: {
      "content-length": file.length,
      "content-type": "text/plain"
    }
  });
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

  console.log("* Upload File **********************************************************************");
  const inputFile = core.getInput('file');
  console.dir(inputFile);
  if (inputFile) {
    upload(inputFile, context, octokit);
  }

  console.log("* Upload Files **********************************************************************");
  const inputPattern = core.getInput('pattern');
  console.dir(inputPattern);
  if (inputPattern) {
    glob(inputPattern, {}, function (er, match) {
      console.log(`Uploading matched file: ${match}`);
      upload(match, context, octokit);
    })
  }
}

run();
