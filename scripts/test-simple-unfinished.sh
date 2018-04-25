#!/bin/sh
############################################
# Test translation
#
# Author: edward.sutton@subsite.com
###########################################

SourceFolder=test/simple/unfinished
WorkingFolder=${SourceFolder}-output

echo Clean existing WorkingFolder: ${WorkingFolder}
rm -rf ${WorkingFolder}

mkdir -p ${WorkingFolder}
cp ${SourceFolder}/*.ts ${WorkingFolder}

node index.js ${API_KEY} ${WorkingFolder} en

echo '******************************'
echo     ${WorkingFolder}
echo '******************************'
ls -al ${WorkingFolder}




