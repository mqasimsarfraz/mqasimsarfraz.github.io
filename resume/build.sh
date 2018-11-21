#!/bin/bash

INPUT="resume.tex"
OUTPUT="resume.pdf"
DOCKER_IMAGE="blang/latex:ubuntu"

echo "====>: Creating ${OUTPUT} from ${INPUT}"

docker run --rm -i --user="$(id -u):$(id -g)" --net=none -v "${PWD}":/data ${DOCKER_IMAGE} pdflatex ${INPUT} > /dev/null 2>&1
if [[ $? -ne 0 ]]; then
  echo "Error when creaing pdf, check resume.log for details"
fi

echo "====>: Finished creating ${OUTPUT}"
