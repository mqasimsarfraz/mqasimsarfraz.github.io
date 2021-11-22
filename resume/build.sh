#!/bin/bash

INPUT="resume.tex"
OUTPUT="resume.pdf"
PORTFOLIO_PATH="../static/resume"
DOCKER_IMAGE="blang/latex:ubuntu"


echo "====>: Pulling ${DOCKER_IMAGE} ..."
docker pull ${DOCKER_IMAGE}

echo "====>: Creating ${OUTPUT} from ${INPUT} ..."

docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "${PWD}":/data ${DOCKER_IMAGE} pdflatex ${INPUT} > /dev/null

echo "====>: Copying ${INPUT} to ${PORTFOLIO_PATH}"
mkdir -p ${PORTFOLIO_PATH}
cp resume.pdf ${PORTFOLIO_PATH}

echo "====>: Finished creating ${OUTPUT}"
