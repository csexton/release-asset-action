# Release Asset Action

A GitHub action to add files to a release.

This action will only add files to an existing release, a typical use case:

1. Create a draft release
1. Trigger an aciton
1. Build your project
1. Upload any binaries, artifiacts or other assets to the release

In other words all this action does it upload assets to a release. For more information on creating releases see [Creating Releases](https://help.github.com/en/articles/creating-releases).

### Using this action

To upload a single file add a step like the following your workflow:

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


# License

MIT. See [LICENSE](LICENSE) for details.
