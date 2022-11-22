#!/bin/bash

if [ "$1" == "" ]; then
  echo "Please provide 'pull' or 'push' as first argument"
  exit 1
fi

FTP_EXCLUDES="${FTP_EXCLUDES:-}"

FTP_SERVER="${FTP_SERVER:-ftp://}"
FTP_USER="${FTP_USER:-anonymous}"
FTP_PASSWORD="${FTP_PASSWORD:-password}"

FTP_LOCAL_DIR="${FTP_LOCAL_DIR:-/}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"

if [ "$2" != "" ]; then
  echo "FTP_LOCAL_DIR set by argument 2"
  FTP_LOCAL_DIR=$2
fi

if [ "$3" != "" ]; then
  echo "FTP_REMOTE_DIR set by argument 3"
  FTP_REMOTE_DIR=$3
fi

FTP_PARALLEL="${FTP_PARALLEL:-5}"

FTP_INIT="${FTP_INIT:-}"
FTP_INIT="$FTP_INIT set ftp:list-options -a;"
FTP_INIT="$FTP_INIT set ftp:charset UTF-8;"
FTP_INIT="$FTP_INIT set ssl:verify-certificate no;"
FTP_INIT="$FTP_INIT set ftp:ssl-allow no;"

FTP_POST_CMD="${FTP_POST_CMD:-}"

FTP_DRY_RUN="${FTP_DRY_RUN:-}"
if [ "$FTP_DRY_RUN" = true ] ; then
  FTP_DRY_RUN="--dry-run"
else
  FTP_DRY_RUN=""
fi

echo "FTP_SERVER: $FTP_SERVER"
echo "FTP_USER: $FTP_USER"
echo "FTP_PASSWORD: {FTP_PASSWORD}"

echo "FTP_LOCAL_DIR: $FTP_LOCAL_DIR"
echo "FTP_REMOTE_DIR: $FTP_REMOTE_DIR"

echo "FTP_INIT: $FTP_INIT"
echo "FTP_PARALLEL: $FTP_PARALLEL"
echo "FTP_DRY_RUN: $FTP_DRY_RUN"
echo "FTP_POST_CMD: $FTP_POST_CMD"


# mirror dry run and: --dry-run
getDir () {
  mkdir -p ${FTP_LOCAL_DIR}
  lftp -u "${FTP_USER},${FTP_PASSWORD}" -e " \
  $FTP_INIT \
  lcd '${FTP_LOCAL_DIR}'; \
  cd '${FTP_REMOTE_DIR}'; \
  mirror $FTP_DRY_RUN --verbose=8 --parallel=${FTP_PARALLEL} --exclude-glob node_modules/ --exclude-glob .git/ $FTP_EXCLUDES --delete; \
  $FTP_POST_CMD \
  quit; \
  " "${FTP_SERVER}"
}

pushDir () {
  mkdir -p ${FTP_LOCAL_DIR}
  lftp -u "${FTP_USER},${FTP_PASSWORD}" -e " \
  $FTP_INIT \
  lcd '${FTP_LOCAL_DIR}'; \
  cd '${FTP_REMOTE_DIR}'; \
  mirror $FTP_DRY_RUN --reverse --verbose=8 --parallel=${FTP_PARALLEL} --exclude-glob node_modules/ --exclude-glob .git/ $FTP_EXCLUDES; \
  $FTP_POST_CMD \
  quit; \
  " "${FTP_SERVER}"
}

if [ "$1" == "pull" ]; then
  echo "* start pull"
  getDir
  echo "* end pull"
fi

if [ "$1" == "push" ]; then
  echo "* start push"
  pushDir
  echo "* end push"
fi
