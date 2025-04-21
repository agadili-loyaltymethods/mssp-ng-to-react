#!/bin/bash

LOG_FILE=build_fail.log
[ -s ${LOG_FILE} ] && >${LOG_FILE}
exec > >(tee -a ${LOG_FILE} )
exec 2>&1

export USERID=$(id -u)
export GROUPID=$(id -g)
echo "Running as UID=$USERID, GID=$GROUPID"
cd $(dirname $0)
source lib/functions.bash

CONTAINER_NAME="builder-$(echo ${JOB_NAME} | tr '/ ' '._').${BRANCH_NAME}"
if [ -n "$CHANGE_ID" ]
then
    CONTAINER_NAME="${CONTAINER_NAME}-PR${CHANGE_ID}"
fi
CONTAINER_NAME="${CONTAINER_NAME}-${BUILD_ID}"

pull_nodejs_base_images

timeout 15m \
    docker-compose -f builder.yml run \
      --rm -w "$WORKSPACE" \
      --entrypoint "SBI/nvm.sh" \
      --name "$CONTAINER_NAME" \
      builder
