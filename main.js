const core = require('@actions/core');
const fs = require('fs');
const github = require('@actions/github');
const glob = require('glob');
const mime = require('mime-types')
const path = require('path');

process.on('unhandledRejection', handleError);

function handleError(err) {
  console.error(err);
  core.setFailed(err.message);
}

async function upload(filePath, context, octokit) {
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);
  let mimeType = mime.lookup(fileName) || 'application/octet-stream'

  let { data: uploadAsset } = await octokit.repos.uploadReleaseAsset({
    name: fileName,
    file: file,
    url: context.payload.release.upload_url,
    headers: {
      "content-length": file.length,
      "content-type": mimeType
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
    glob(inputPattern, {}, function (er, matches) {
      for (let match of matches) {
        console.log(`Uploading matched file: ${match}`);
        console.dir(match);
        upload(match, context, octokit);
      }
    })
  }
}

run();
