const core = require('@actions/core');
const fs = require('fs');
const github = require('@actions/github');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

process.on('unhandledRejection', err => {
  core.error(err);
  core.setFailed(err.message);
});

async function uploadMultiple(fileList, context, octokit, url, assets) {
  for (let file of fileList) {
    upload(file, context, octokit, url, assets);
  }
}

async function upload(filePath, context, octokit, url, assets) {
  filePath = filePath.trim();
  let file = fs.readFileSync(filePath);
  let fileName = path.basename(filePath);
  let mimeType = mime.lookup(fileName) || 'application/octet-stream';

  if (core.getInput('allow-overwrite')) {
    const asset = assets.find(a => a.name === fileName);
    if (asset != null) {
      console.log(`Deleting existing asset file: ${fileName}`);
      try {
        await octokit.repos.deleteReleaseAsset({
          owner: context.repo.owner,
          repo: context.repo.name,
          asset_id: asset.id,
        });
      } catch (error) {
        core.warning(`Failed to delete asset file: ${fileName}`);
      }
    }
  }

  console.log(`Uploading file: ${filePath}`);

  try {
    await octokit.repos.uploadReleaseAsset({
      name: fileName,
      file: file,
      url: url,
      headers: {
        'content-length': file.length,
        'content-type': mimeType,
      },
    });
  } catch (error) {
    core.setFailed(
      `Upload failed: ${error.message} ${JSON.stringify(error.errors)}`,
    );
  }
  console.log(`Uploaded ${fileName}`);
}

async function run() {
  const token = core.getInput('github-token', { required: true });
  const octokit = new github.GitHub(token);
  const context = github.context;

  // Get the target URL and assets
  let url, assets;
  if (context.payload.release) {
    url = context.payload.release.upload_url;
    assets = context.payload.release.assets;
  } else {
    url = core.getInput('release-url', { required: false });
    if (!url) {
      try {
        const release = await octokit.repos.getRelease({
          owner: context.repo.owner,
          repo: context.repo.name,
          release_id: core.getInput('release-id', { required: false }),
        });
        url = release.upload_url;
        assets = release.assets;
      } catch (error) {
        core.setFailed(
          `Failed to get the release: ${error.message} ${JSON.stringify(
            error.errors,
          )}`,
        );
      }
    }
  }
  if (!url) {
    core.warning(
      'No release URL, skipping. This action requires either a release URL passed in or run as part of a release event',
    );
    return;
  }

  core.setOutput('url', url);

  console.log(`Uploading release assets to: ${url}`);

  var list = [];

  // Add any single files
  list = list.concat(core.getInput('file'));

  // Get list of new-line-seperated files
  if (core.getInput('files')) {
    list = list.concat(core.getInput('files').split(/\r?\n/));
  }

  // Get glob pattern of files
  if (core.getInput('pattern')) {
    list = list.concat(glob.sync(core.getInput('pattern')));
  }

  // Clean up list by removing any non-truthy values
  list = list.filter(n => n);

  // Upload the lot of 'em
  uploadMultiple(list, context, octokit, url, assets);
}

run();
