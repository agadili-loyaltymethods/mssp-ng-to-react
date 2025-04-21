# determine ECR host
set_ecr_host_var() {
  export  ECR_HOST=${ECR_HOST:-$(dig +short docker.devops.lmvi.net cname | sed 's/\.$//')}
  if [ -z "$ECR_HOST" ]
  then
    echo "Cannot resolve ECR hostname.  Is dig installed or docker.devops.lmvi.net CNAME configured?"
    exit 1
  fi
  REGION=$(echo $ECR_HOST | sed 's/^[0-9]*\.dkr\.ecr\.//; s/\.amazonaws\.com//')
  echo "Running in region $REGION"
  aws --region $REGION ecr get-login --no-include-email | bash
}

# determine build info from git
set_build_var() {
  BUILD=${BUILD:-$(python $(dirname $0)/version.py)}
  if [ -z "$BUILD" ]
  then
    echo "Could not determine build version!"
    exit 1
  fi
}

# create docker ignore for prod images (we don't want to include the git
# repo files)
create_dockerignore() {
  echo ".git" > $IGNORE_FILE
}

# build the base image that each service will inherit from
build_image() {
  local service=${1%%:*}
  local dockerfile=${2:-Dockerfile.$service}
  [ $BRANCH_NAME == "master" ] && local tag=${BRANCH_NAME}-${service}-${BUILD} || local tag=${BRANCH_NAME}-${service}-${BUILD}-$BUILD_ID
  docker build -t ${IMAGE_NAME}:$tag -f $DIR/docker/$dockerfile .
  [ $? -ne 0 ] && exit 1
}

# push the images to the needed registries
push_to_registries() {
  local tag=$1
  for acct_region in  $(cat $DIR/registry.conf)
  do
    local acct=$(echo $acct_region | cut -f1 -d:)
    local region=$(echo $acct_region | cut -f2 -d:)
    local ecr_host="$acct.dkr.ecr.$region.amazonaws.com"
    aws ecr get-login --registry-ids $acct --region $region --no-include-email | bash

    echo "PUSHING tag $tag for $ARCH to $ecr_host"
    docker tag ${IMAGE_NAME}:${tag} ${ecr_host}/${IMAGE_NAME}:${tag}
    [ $? -ne 0 ] && exit 1
    docker push ${ecr_host}/${IMAGE_NAME}:${tag}
    [ $? -ne 0 ] && exit 1
  done
}

# remove images
remove_images() {
  local tag=$1
  local srv=$2
  docker rmi \
    ${IMAGE_NAME}:${tag}
  for acct_region in  $(cat $DIR/registry.conf)
  do
    local acct=$(echo $acct_region | cut -f1 -d:)
    local region=$(echo $acct_region | cut -f2 -d:)
    local ecr_host="$acct.dkr.ecr.$region.amazonaws.com"
    docker rmi \
      ${ecr_host}/${IMAGE_NAME}:${tag}
    [ $? -ne 0 ] && exit 1
  done
}


# login to ecr and push images
push_to_ecr() {
  local service=${1%%:*}
  set_build_var
  [ $BRANCH_NAME == "master" ] && local tag=${BRANCH_NAME}-${service}-${BUILD} || local tag=${BRANCH_NAME}-${service}-${BUILD}-$BUILD_ID
  local latest_tag=${BRANCH_NAME}-${service}-latest
  docker tag ${IMAGE_NAME}:${tag} ${IMAGE_NAME}:${latest_tag}
  set_ecr_host_var
  push_to_registries $tag
  push_to_registries $latest_tag
  remove_images $tag
  remove_images $latest_tag

}

# pull latest images from ecr (in case of failover and images are not up to date or do not exist)
pull_nodejs_base_images() {
  # default region should be set in /jenkins/.aws/config on jenkins server
  aws ecr get-login --no-include-email | bash
  [ $? -ne 0 ] && exit 1

  set_ecr_host_var
  for image in rcx-nodejs-base rcx-nodejs-build
  do
    docker pull $ECR_HOST/$image:20.11.1
    [ $? -ne 0 ] && exit 1
    docker tag $ECR_HOST/$image:20.11.1 $image:20.11.1
    [ $? -ne 0 ] && exit 1
  done
}
