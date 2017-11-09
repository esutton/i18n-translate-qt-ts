#!/usr/bin/env node

// See: https://medium.freecodecamp.org/writing-command-line-applications-in-nodejs-2cf8327eee2
// https://github.com/tj/commander.js


'use strict';

const fs = require('fs');
const program = require('commander');
const xmldom = require('xmldom').DOMParser;

function getElementByTagName(parent, name) {
  const elementList = parent.getElementsByTagName(name);
  if (!elementList.length) {
    return '';
  }
  if (elementList.length > 1) {
    console.warn(`*** Found ${elementList.length} elements matching name: ${name}`)
  }
  return elementList[0];
}

function dump (doc, message) {
  //console.log(`dbg: message: = ${message}`);  
  const source = getElementByTagName(message, 'source');
  const translation = getElementByTagName(message, 'translation');
  const translationType = translation.getAttributeNode('type');
  // console.log(`dbg: source: ${source}`);  
  // console.log(`dbg: translation: ${translation}`);  
  // console.log(`dbg: translationType: ${translationType}`);  
  if(translationType) {
    //console.log(`dbg: translationType.value: ${translationType.value}`);  
    if (translationType.value !== 'unfinished') {
      console.log('dbg: already translateed');
      return;
    }    
  }


  console.log(`dbg: translate "${source.firstChild.nodeValue}"`);
}

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
  console.log(`dbg: language[${i}] = `, languageList[i]);
}

console.log('ToDo: 1) Iterate <inputLanguage> TS file, 2) For each language translate, 3) Build new language TS file');


const inputFileName = 'test/i18n/tsr_en.ts';
fs.readFile(inputFileName, 'utf-8', function (err, data) {
  if (err) {
    throw err;
  }
  var thisgenreobject,
      thisgenre,
      doc;
  doc = new xmldom().parseFromString(data, 'application/xml');
  const messageList = doc.getElementsByTagName('message');
  for (let i = 0; i < messageList.length; i += 1) {
    const message = messageList[i];
    dump(doc, message);
    // thisgenreobject = messageList[message];
    // if (thisgenreobject.firstChild) {
    //   thisgenre = thisgenreobject.firstChild.nodeValue;
    //   if (thisgenre === 'Computer') {
    //     console.log(thisgenreobject.parentNode.getElementsByTagName('title')[0].firstChild.nodeValue);
    //   }
    // }
  }
});

