#!/bin/bash
# ----------------------------------------------------------------------------------------------------------------------
# This script generates the package archive of input codegen with all node modules bundled
#
# 1. check if git working copy is clean
# 2. create a workspace directory in .tmp (delete if present)
# 3. run git archive to create a sanitised copy of the source in workspace
# 4. fresh npm install and test this newly copied source
# 5. update package.json of this new source to bundle all dependencies
# 6. perform npm pack and npm prune (to remove devDependencies)
# 7. extract npm pack tar file and conver to zip
# 8. cleanup!
#
# Note that this script has to move around directories since some npm and zip commands do not support relative paths.
# `pushd` and `popd`  is used to keep track of directory stack.
# ----------------------------------------------------------------------------------------------------------------------

# stop on error
set -e;
CODEGEN="codegen-"$1 # Code gen to be packaged, first input argument, prefix codegen can be removed
echo "Starting the fat packaging procedure for $CODEGEN." ;

# ensure that the working tree is clean
source ./npm/package/require_clean_work_tree.sh;
require_clean_work_tree "create package";

if [ ! -d "./codegens/$CODEGEN" ]; then
  echo "Codegen '$CODEGEN' doesn't exist, please enter valid name";
  exit 1
fi
# function to be called on exit
# and ensure cleanup is called before the script exits
SWD=$PWD;
PACK_DIR="$(mktemp -d)"; # the workspace path to be used for creating the package
echo $PACK_DIR;
mkdir -p .tmp; # failsafe (also needed in CI)
LOG_FILE="$PWD/.tmp/package-$(date +'%s')-$RANDOM.log";
echo "Activity started at: $(date)" > $LOG_FILE;

function cleanup {
  echo -e "\n - cleaning up $PACK_DIR";
  [ -d "$PACK_DIR" ] && rm -rf "$PACK_DIR"; # remove temp workspace
  cd "$SWD"; # switch to starting work directory
  echo -e "   logs available at: $LOG_FILE";

  # log end time
  echo "Activity exited at: $(date)" >> $LOG_FILE;

  if [ "$?" != "0" ]; then
    echo -e "\033[31m\nPackaging failed!\033\n";
    exit 1;
  fi
}
trap cleanup EXIT;


# get the variables in order
PACK_SOURCEDIR="files";
PACK_BASEDIR="package"; # dir created by npm pack inside the package tar file

# the output path and file
OUT_DIR="out";
OUT_POSTFIX="$(git describe --always)";
OUT_GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD:codegens/$CODEGEN | sed -e 's/^feature\///g' -e 's/[^a-zA-Z0-9]/-/g')";
OUT_FILE="${OUT_POSTFIX#"v"}+${OUT_GIT_BRANCH}.package.zip";
OUT_PATH="${OUT_DIR}/${OUT_FILE}";


echo " - created clean packaging workspace";
echo "   at $PACK_DIR";
echo "   for $OUT_FILE";
echo "   see logs at $LOG_FILE";
echo "";

# create a copy of the present git head into the workspace directory
mkdir -p "$PACK_DIR/$PACK_SOURCEDIR";
git archive HEAD:codegens/$CODEGEN | tar -x -C "$PACK_DIR/$PACK_SOURCEDIR";
echo " - archived current git head to workspace.";


# enter into package directory to perform tasks that cannot be done using relative path references
pushd "$PACK_DIR" &>/dev/null;

    # get into the newly archived dir
    pushd "$PACK_SOURCEDIR" &>/dev/null;

    # perform npm install to freshly fetch node modules
    echo " - fresh installing package in workspace and running tests. will take some time"
    npm install . >> $LOG_FILE;

    npm test;

    echo " - pruning for production"
    npm prune --production >> $LOG_FILE;
    
    echo " - removing test, npm folder before packaging"
    rm -rf /test
    rm -rf /npm
    echo " - creating package.";
    zip -rq "$OUT_FILE" .; # re-enable npm pack when it starts working and remove this line

    # exit the package source directory
    popd &>/dev/null;
# move out to SWD
popd &>/dev/null;

# move the package file to output directory
mkdir -p "$(dirname $OUT_PATH)";
mv -f "$PACK_DIR/$PACK_SOURCEDIR/$OUT_FILE" "$OUT_PATH";
echo " - package created at $OUT_PATH ($(du -k "$OUT_PATH" | cut -f1) KB)";

# clean up workspace
[ -d "$PACK_DIR" ] && rm -rf "$PACK_DIR";