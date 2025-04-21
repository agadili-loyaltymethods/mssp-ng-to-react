#!/bin/bash

LOG_FILE=build_fail.log
TMP_IMG=$(mktemp)
SCAN="scan_status.log"

if grep "ERR" ${LOG_FILE} >> /dev/null;then
 :
 else
 mv ${LOG_FILE} ${LOG_FILE}-txt-$$
 fi
exec > >(tee -a ${LOG_FILE} )
exec 2>&1

shopt -s extglob

# what the docker image will be called
IMAGE_NAME=rcx-member-self-service-portal


# get root dir
DIR=$(dirname $0)

# get service names from manifest
SERVICE_NAMES=$(cat $DIR/service-manifest.txt)

# load functions
source $DIR/lib/functions.bash
source $DIR/scan.sh

# docker ignore file (specifies which files to not include in the docker
# build context
IGNORE_FILE=$DIR/../.dockerignore

# remove the docker ignore file if it exists
[ -f $IGNORE_FILE ] && rm $IGNORE_FILE
[ -s $LOGFILE ] && cat /dev/null > $LOGFILE
[ -s $SCAN ] && cat /dev/null > $SCAN

# set BUILD variable
set_build_var
# set ECR_HOST variable
set_ecr_host_var

# we want to be able to behave differently for each branch
case $BRANCH_NAME in
  develop | feature-* | bug-*)
    for service in $SERVICE_NAMES
    do
      #[ -f $TMP_IMG ] && cat /dev/null > $TMP_IMG
      build_image $service | tee -a $TMP_IMG
      #start_scan_local "$(cat $TMP_IMG| tail -n1|awk '{print $3}')"
      #[ $? -ne 0 ] && { export SCAN_STATUS=fail ; echo "Image has vulnerabilities,Please check and fix" ; } || :
      #cat /dev/null > $TMP_IMG
      push_to_ecr $service
    done
    rm -f $TMP_IMG
    ;;
  *)
    if [ -z "$BRANCH_NAME" ]
    then
      echo "No branch name provided!"
      exit 1
    fi
    for service in $SERVICE_NAMES
    do
      create_dockerignore
      build_image $service 
      push_to_ecr $service
    done
    ;;
esac

# remove the docker ignore file if it exists
[ -f $IGNORE_FILE ] && rm $IGNORE_FILE

# exporting image scan status
echo $SCAN_STATUS > $SCAN
exit 0
