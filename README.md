# Release Asset Action

A GitHub action to add files to a release.

### Parameters

-  file:
    description: The file to upload
    required: false
-   files:
    description: A new line seperated list of files upload
    required: false
-   pattern:
    description: Glob pattern of files to upload
    required: false
-   github-token:
    description: The GitHub token used to create an authenticated client
    required: true
-   release-url:
    description: The url of the release files are uploaded to
    required: false

### There are two ways u can use this action:
- Trigger on a release (does not work with drafts)
- Chain it after another action that creates an release

If you trigger on release there is no need to provide the `release-url` tho if you trigger normally and chain it after another action you need to provide this parameter.

Example on release:
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
      uses: csexton/release-asset-action@v1
      with:
        file: my-release.zip
        github-token: ${{ secrets.GITHUB_TOKEN }}
    - run: false
```
 Example chain after another action:
 
 ```
 name: Build and relase

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Set up JDK 11
        uses: actions/setup-java@v1
        with:
          java-version: 11
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: Auto generated release
          draft: true
          prerelease: false
      - name: Build win zip
        run: ./gradlew distZip -PprojVersion=${GITHUB_REF##*/} -PjavafxPlatform=win
      - name: Build linux tar
        run: ./gradlew distTar -PprojVersion=${GITHUB_REF##*/} -PjavafxPlatform=linux
      - name: Build mac tar
        run: ./gradlew distTar -PprojVersion=${GITHUB_REF##*/} -PjavafxPlatform=mac && ls ./build/distributions
      - name: Upload Assets to Release with a wildcard
        uses: csexton/release-asset-action@v1
        with:
          pattern: "build/distributions/*"
          github-token: ${{ secrets.GITHUB_TOKEN }}
          release-url: ${{ steps.create_release.outputs.upload_url }}
 ```

### Using this action

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
