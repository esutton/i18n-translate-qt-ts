#!/usr/bin/env node

// See: https://medium.freecodecamp.org/writing-command-line-applications-in-nodejs-2cf8327eee2
// https://github.com/tj/commander.js

'use strict';

const fs = require('fs');
const glob = require('glob-fs')({ gitignore: true });
const google = require("google-translate");
const program = require('commander');
const xmldom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

var m_googleTranslate = null; 

function getAttributeByName(element, name) {
  const attribute = element.getAttributeNode(name);
  if(!attribute) {
    return null;
  }
  return attribute.value;
}

function getElementByName(parent, name) {
  const elementList = parent.getElementsByTagName(name);
  if (!elementList.length) {
    console.warn('*** tagName not found:', name);
    return null;
  }
  if (elementList.length > 1) {
    console.warn(`*** Found ${elementList.length} elements matching name: ${name}`)
  }
  return elementList[0];
}

// If no type is set, the message is "finished".
// http://doc.qt.io/qt-5/linguist-ts-file-format.html
//
// Note: translationType applies only to a pre-existing translation.
// For example, if a human reviewed translation, Google Translate should leave it alone.
//
// returns finished or unfinished|vanished|obsolete
function getTranslationType(message, translateFrom) {
  const translation = getElementByName(message, 'translation');
  if(!translation) {
    console.warn(`*** translation node missing for: ${translateFrom}`)
    return 'unfinished';
  }
  const translationType = getAttributeByName(translation, 'type');
  if(!translationType) {
    return 'finished';
  }
  return translationType;
}

// Translate text from message/source message/translation  
//
// ToDo: Handle XML special characters '&lt;'
// ToDo: Split by %
// ToDo: If all % args, then skip translate
// ToDo: If all numbers, then skip translate
//
// Challenges:
// -------------------------
// translate: '&lt;- Back'
// translate: 'Send To:  %1'
// translate: '-100'
// translate: '+100'
// translate: 'Attachment(s): %n'
// translate: 'Error creating PDF file %1'
// translate: '%1: %2, %3 %4, %5 %6'
//
var messageTranslate = function(doc, message, callback) {
  // console.log('dbg: message:', message);
  const source = getElementByName(message, 'source');

  const translationNode = getElementByName(message, 'translation');
  console.log(`dbg: messageTranslate source "${source.firstChild.nodeValue}"`);
  console.log(`dbg: messageTranslate translationNode "${translationNode.childNodes[0]}"`);

  console.log('dbg: messageTranslate translationNode.firstChild', translationNode.firstChild);

  const translateFrom = source.firstChild.nodeValue;

  // translationType applies only to a pre-existing translation
  const translationType = getTranslationType(message, translateFrom);
  console.log(`dbg: messageTranslate translationType "${translationType}"`);
  if(translationType === 'finished') {
    // return;
    return callback(TRANSERR.NOT_TRANSLATED, text);
  }

  const languageSource = 'en';
  const languageDestination = 'es';
  const text = source.firstChild.nodeValue;

  console.log(`translate text '${text}' from ${languageSource} to '${languageDestination}'`);

  // fire the google translation
  m_googleTranslate.translate(text, languageSource, languageDestination, function(err, translation) {
    if (err) {
      // console.warn('*** translation error: ', err);
      console.error(`*** Error: google translate failed for: "${text}"`);
      return callback(TRANSERR.NOT_TRANSLATED, text);
    }

    // return the translated text
    console.log(`translated '${text}' to '${translation.translatedText}'`);

    let textNode = translationNode.firstChild;
    if(textNode == null ) {
      textNode = doc.createTextNode(translation.translatedText);
      translationNode.appendChild(textNode);
    } else {
      textNode.nodeValue = translation.translatedText;  
    }

    // translationNode.removeAttribute('type');
    translationNode.setAttribute('type','finished');
    return callback(null, translation.translatedText);
  });
}

// Translate all context's found in Qt *.ts file
// Translate text from message/source message/translation  
function translateQtTsFile(inputFileName, language) {
  console.log('******************************************************');
  console.log(` Translate to ${language}`);
  console.log('******************************************************');
  // Get project name from input filename.
  // Example:  myproject_en.ts
  const pos = inputFileName.lastIndexOf('_');
  const filextensionLength = inputFileName.length - pos;
  if (pos < 0 || filextensionLength < 6) {
    console.log(`*** Errror: Unexpected input file name format: "${inputFileName}"`);
    return;
  }
  const outputFilename = `${inputFileName.substring(0, pos)}_${language}_output.ts`;

  inputFileName = 'test/simple/unfinished/tsr_es.ts';
    fs.readFile(inputFileName, 'utf-8', function (err, data) {
    if (err) {
      throw err;
    }
    const doc = new xmldom().parseFromString(data, 'application/xml');
    const tsElement = doc.getElementsByTagName('TS')[0];
    const languageDestination = getAttributeByName(tsElement, 'language');
    console.log('languageDestination:', languageDestination);

    const promises = [];
    const contextList = doc.getElementsByTagName('context');
    for (let i = 0; i < contextList.length; i += 1) {
      const context = contextList[i];
      const messageList = context.getElementsByTagName('message');
      for (let j = 0; j < messageList.length; j += 1) {
        const message = messageList[j];
        promises.push(
          new Promise((resolve, reject) => {
              // Translate text from message/source message/translation  
              messageTranslate(doc, message, function(err, translation) {
                if (err) {
                  console.error('** Error messageTranslate failed err', err);
                  reject(err); 
                } else {
                  resolve();
                }
              });
          })
        );
      }   
    } // end for context

    // When all strings are translated, write the translations to file
    Promise.all(promises).then(() => {
      const xml = new XMLSerializer().serializeToString(doc);
      fs.writeFile(outputFilename, xml, function(err) {
        if(err) {
            return console.log(err);
        }
      });       
    }).catch(err => console.log('errorerrorerrorerrorerror', err));

  });
    
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
  _googleTranslateApiKey = googleTranslateApiKey;
  _workingFolder = workingFolder;
  _inputLanguage = inputLanguage;
  _outputLanguageList = outputLanguageList;
}); 

program.parse(process.argv);

const inputLanguagePath = `${_workingFolder}/*_${_inputLanguage}.ts`;
const inputFileList = glob.readdirSync(inputLanguagePath, {});
console.log('dbg inputFileList', inputFileList);

if(!inputFileList.length) {
  console.error(`*** Error no input language found (${_inputLanguage}) in path: ${inputLanguagePath}`)
  return;
}

if(inputFileList.length > 1) {
  console.error(`*** Error found ${inputFileList.length} matches for: ${inputLanguagePath}`)
  return;
}

const tsFileInputLanguage = inputFileList[0];
const languageList = _outputLanguageList ? _outputLanguageList.split(',') : [];
if(!languageList.length) {
  console.error(`*** Error found no output languages`)
  return;
}

console.log('inputFileList:', inputFileList);

m_googleTranslate = google(_googleTranslateApiKey);

for(let i = 0; i < languageList.length; i += 1) {
  const language = languageList[i];
  console.log('dbg translate:', language);
  const xml = translateQtTsFile(tsFileInputLanguage, language);
  console.log('dbg Stop at one for debugging');
  return; // Stop at one for debugging
}

