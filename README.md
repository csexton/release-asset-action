# Release Asset Action

A GitHub action to add files to a release.

### Parameters

| Parameter | Description | Required |
| --------- | ----------- | -------- |
| `file` | The file to upload | Optional |
| `files` | A new line seperated list of files upload | Optional |
| `pattern` | Glob pattern of files to upload | Optional |
| `github-token` | The GitHub token used to create an authenticated client | Required |
| `release-url` | The target url for the release file uploads | Optional |

### There are two ways you can use this action:

- Trigger on a release (does not work with drafts)
- Chain it after another action that creates an release

If this release is triggered on a "release" event, the url can automatically be
detected. However, if it is chained the `release-url` will need to be passed in
from the previous steps.

### Examples

Example on release event:

```
name: Release

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: macOS-10.14
    steps:
    - uses: actions/checkout@v1
    - name: Build
      run: make
    - name: Upload asset to release
      uses: csexton/release-asset-action@v2
      with:
        file: my-release.zip
        github-token: ${{ secrets.GITHUB_TOKEN }}
    - run: false
```

Example on tag event chained after another action:

 ```
 name: Build and relase

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: Create Release
      id: create_release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        body: Auto generated release
        draft: true
        prerelease: false
    - name: Build
      run: make
    - name: Upload Assets to Release with a wildcard
      uses: csexton/release-asset-action@v1
      with:
        pattern: "build/*"
        github-token: ${{ secrets.GITHUB_TOKEN }}
        release-url: ${{ steps.create_release.outputs.upload_url }}
 ```

### Selecting the right files with this action to upload

To upload a single file add a step like the following your workflow:

```
    - name: Upload asset to release
      uses: csexton/release-asset-action@v1
      with:
        file: my-release.zip
        github-token: ${{ secrets.GITHUB_TOKEN }}
```


You can also set `files` or `pattern` if you need to upload multiple files.

New line seperated list of files:

```
- name: Upload multiple assets to release
  uses: csexton/release-asset-action@v1
  with:
    files: |
      first.zip
      second.zip
      third.tar.gz
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Pattern to glob for files:

```
- name: Upload Assets to Release with a wildcard
  uses: csexton/release-asset-action@v1
  with:
    pattern: "build/*.zip"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```


# License

MIT. See [LICENSE](LICENSE) for details.
