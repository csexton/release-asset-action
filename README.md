# Release Asset Action

A GitHub action to add files to a release.

### Using this action

Add the following step to your build

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
      uses: csexton/release-action@v1
      with:
        file: my-release.zip
        github-token: ${{ secrets.GITHUB_TOKEN }}
    - run: false
```


You can also set `files` or `pattern` if you need to upload multiple files.

New line seperated list of files:

```
- name: Upload multiple assets to release
  uses: csexton/release-action@v1
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
  uses: csexton/release-action@v1
  with:
    pattern: "build/*.zip"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```
