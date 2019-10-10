const github = require('@actions/github');
const fs = require('fs');
//const core = require('@actions/core');

async function run() {
  // This should be a token with access to your repository scoped in as a secret.
  // The YML workflow will need to set myToken with the GitHub Secret Token
  // myToken: ${{ secrets.GITHUB_TOKEN }
  // https://help.github.com/en/articles/virtual-environments-for-github-actions#github_token-secret
  //const token = core.getInput('myToken');
  const token = process.env.GITHUB_TOKEN;

  const octokit = new github.GitHub(token);
  const context = github.context;
  console.log("* Event Name **********************************************************************");
  console.log(context.eventName);
  console.log("* Release **********************************************************************");
  console.log(context.payload.release);

  //const { data: release } = await octokit.repos.updateRelease({
  //  ...context.repo,
  //  release_id: context.payload.release.id,
  //  body: "body from action"
  //});

  file = fs.readFileSync("doc.tar.bz2")
  const { data: uploadAsset } = await octokit.repos.uploadReleaseAsset({
    name: "Artifact",
    file: file,
    url: context.payload.release.upload_url,
    headers: { "content-length": file.length,
      "content-type": "text/plain"} })
  console.log("* UPLOAD **********************************************************************");
  console.log(uploadAsset);


  //console.log("* CONTEXT **********************************************************************");
  //console.log(context);
  //const { data: release } = await octokit.repos.listReleases({
  //  ...context.repo
  //})

  //console.log("* RELEASE **********************************************************************");
  //console.log(release);
}

run();
