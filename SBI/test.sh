#!/bin/bash


LOG_FILE=build_fail.log
if grep "ERR" ${LOG_FILE} >> /dev/null;then
 :
 else
 mv ${LOG_FILE} ${LOG_FILE}-txt
 fi
exec > >(tee -a ${LOG_FILE} )
exec 2>&1

export USERID=$(id -u)
export GROUPID=$(id -g)

CONTAINER_NAME="tester-$(echo ${JOB_NAME} | tr '/ ' '._').${BRANCH_NAME}"
if [ -n "$CHANGE_ID" ]
then
    CONTAINER_NAME="${CONTAINER_NAME}-PR${CHANGE_ID}"
fi
CONTAINER_NAME="${CONTAINER_NAME}-${BUILD_ID}"

cd $(dirname $0)
timeout 15m \
    docker-compose -f test-bed.yml run \
      --rm -w "$WORKSPACE" \
      --entrypoint "SBI/runtests.sh" \
      --name "$CONTAINER_NAME" \
      tester
