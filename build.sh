#!/usr/bin/env bash
# Modified from https://github.com/jmooring/hosting-cloudflare-worker
main() {
  DART_SASS_VERSION=1.89.2
  HUGO_VERSION=0.148.2

  echo "Installing Dart Sass v${DART_SASS_VERSION}..."
  curl -LJO "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  tar -xf "dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  cp -r dart-sass/ /opt/buildhome
  rm -rf dart-sass*

  # Hugo x64
  echo "Installing Hugo v${HUGO_VERSION}..."
  curl -LJO https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
  tar -xf "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
  cp hugo /opt/buildhome
  rm LICENSE README.md hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz

  echo "Setting the PATH environment variable..."
  export PATH=/opt/buildhome:/opt/buildhome/dart-sass:$PATH

  echo "Configuring git..."
  # https://gohugo.io/methods/page/gitinfo/#hosting-considerations
  git fetch --recurse-submodules --unshallow
  # https://github.com/gohugoio/hugo/issues/9810
  git config core.quotepath false

  echo "Starting build..."
  echo Hugo: "$(hugo version)"
  echo Dart Sass: "$(sass --version)"
  echo Node.js: "$(node --version)"
  hugo
}

set -euo pipefail
main "$@"