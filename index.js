#!/usr/bin/env node

// See: https://medium.freecodecamp.org/writing-command-line-applications-in-nodejs-2cf8327eee2
// https://github.com/tj/commander.js


'use strict';

const program = require('commander');

let _googleTranslateApiKey;
let _workingFolder;
let _inputLanguage;
let _outputLanguageList;

program
.version('0.0.1')
.description('Use Google Translate API to translate Qt Linguist TS files')
.usage('<googleTranslateApiKey> <workingFolder> <inputLanguage> <outputLanguageList>')
.arguments('<googleTranslateApiKey> <workingFolder> <inputLanguage> <outputLanguageList>','\nUse Google Translate on Qt Linguist TS files')
.action(function (googleTranslateApiKey, workingFolder, inputLanguage, outputLanguageList) {
  console.log('googleTranslateApiKey:', googleTranslateApiKey);
  console.log('workingFolder:', workingFolder);
  console.log('inputLanguage:', inputLanguage);

  _googleTranslateApiKey = googleTranslateApiKey;
  _workingFolder = workingFolder;
  _inputLanguage = inputLanguage;
  _outputLanguageList = outputLanguageList;

}); 

program.parse(process.argv);


const languageList = _outputLanguageList ? _outputLanguageList.split(',') : [];
console.log('_outputLanguageList:', _outputLanguageList);
for(let i = 0; i < languageList.length; i += 1) {
  console.log(`language[${i}] = `, languageList[i]);
}

console.log('ToDo: 1) Iterate <inputLanguage> TS file, 2) For each language translate, 3) Build new language TS file');

