#!/usr/bin/env node

// See:
// https://medium.freecodecamp.org/writing-command-line-applications-in-nodejs-2cf8327eee2
// https://github.com/tj/commander.js

'use strict';

const fs = require('fs');
const glob = require('glob-fs')({gitignore: true});
const google = require('google-translate');
const program = require('commander');
const xmldom = require('xmldom').DOMParser;
var XMLSerializer = require('xmldom').XMLSerializer;

const Debug = true;

const TranslateStatus = {
  IsUrl: -2,
  IsHtml: -1,
  AlreadyTranslated: 0,
  TranslateFailed: 1,
};

var _googleTranslate = null;
let _googleTranslateApiKey;
let _workingFolder;
let _sourceLanguage;

function getAttributeByName(element, name) {
  const attribute = element.getAttributeNode(name);
  if (!attribute) {
    return null;
  }
  return attribute.value;
}

function getElementByName(parent, name) {
  const elementList = parent.getElementsByTagName(name);
  if (!elementList.length) {
    console.warn(`*** tagName not found: '${name}'`);
    return null;
  }
  if (elementList.length > 1) {
    console.warn(
        `*** Found ${elementList.length} elements matching name: ${name}`)
  }
  return elementList[0];
}

function getElementText(node) {
  if(!node) {
    return '';
  }
  if(!node.firstChild) {
    return '';
  }
  return node.firstChild.nodeValue;
}

// If no type is set, the message is "finished".
// http://doc.qt.io/qt-5/linguist-ts-file-format.html
//
// Note: translationType applies only to a pre-existing translation.
// For example, if a human reviewed translation, Google Translate should leave
// it alone.
//
// returns finished or unfinished|vanished|obsolete
function getTranslationType(message, sourceText) {
  const translation = getElementByName(message, 'translation');
  if (!translation) {
    return 'unfinished';
  }

  if (!sourceText) {
    console.warn(`*** translation has no source text to translate: ${sourceText}`)
    return 'finished';
  }

  if(sourceText.length > 0 && translation.firstChild === null) {
    // If sourceText exists but translation is missing
    return 'unfinished';
  }

  const translationType = getAttributeByName(translation, 'type');
  if (!translationType) {
    return 'finished';
  }
  return translationType;
}

function setTranslatedText(doc, message, translationNode, translatedText) {
  if (translationNode === null ) {
    translationNode = doc.createElement('translation');
    message.appendChild(translationNode);
    translationNode.setAttribute('type', 'unfinished');
  }

  let textNode = translationNode.firstChild;
  if (textNode == null) {
    textNode = doc.createTextNode(translatedText);
    translationNode.appendChild(textNode);
  } else {
    textNode.nodeValue = translatedText;
  }
  translationNode.setAttribute('type', 'finished');  
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
function messageTranslate(targetLanguage, doc, message, callback) {
  let translateApiCallCount = 0;
  // console.log('dbg: message:', message);
  const source = getElementByName(message, 'source');

  let translationNode = getElementByName(message, 'translation');
  // console.log(`dbg: messageTranslate source "${source.firstChild.nodeValue}"`);
  // console.log(`dbg: messageTranslate translationNode "${
  //     translationNode.childNodes[0]}"`);
  // console.log(
  //     'dbg: messageTranslate translationNode.firstChild',
  //     translationNode.firstChild);

  const sourceText = getElementText(source);

  // translationType applies only to a pre-existing translation
  const translationType = getTranslationType(message, sourceText);
  // console.log(`dbg: messageTranslate translationType "${translationType}"`);
  if (translationType === 'finished') {
    // console.log(
    //   `finished skipping '${sourceText}'`);
    callback(TranslateStatus.AlreadyTranslated, sourceText);
    return translateApiCallCount;
  }

  // passthrough if contains HTML
  if (/<[a-z][\s\S]*>/i.test(sourceText) == true) {
    console.warn(`'*** Warning: text detected as html: ${sourceText}`);
    callback(TranslateStatus.IsHtml, sourceText);
    return translateApiCallCount;
  }

  // it is just a url
  if (sourceText.indexOf("http://") == 0 && sourceText.indexOf(" ") < 0) {
    console.warn(`'*** Warning: text detected as url: ${sourceText}`);
    callback(TranslateStatus.IsUrl, sourceText);
    return translateApiCallCount;
  }

  if(_sourceLanguage === targetLanguage) {
    // No need to call API to translate
    // Qt QTranslator.load fails if qm file was made from an unfinished ts file
    const translatedText = sourceText;
    setTranslatedText(doc, message, translationNode, translatedText);
    callback(null, sourceText);
    return translateApiCallCount;
  }

  // console.log(
  //     `translate text '${sourceText}' from ${_sourceLanguage} to '${targetLanguage}'`);

  // fire the google translation
  translateApiCallCount += 1;
  _googleTranslate.translate(
      sourceText, _sourceLanguage, targetLanguage, function(err, translation) {
        if (err) {
          // console.warn('*** translation error: ', err);
          console.error(`*** Error: google translate from '${_sourceLanguage}' to '${targetLanguage}' failed for: "${sourceText}"`);
          console.error(`*** Error: google translate err: ${err}`);
          callback(TranslateStatus.TranslateFailed, sourceText);
          return translateApiCallCount;
        }

        if(!translation) {
          console.error(`*** Error: google translate '${targetLanguage}' failed for: "${sourceText}"`);
          callback(TranslateStatus.TranslateFailed, sourceText);
          return translateApiCallCount;
        }

        // Fix Google Translate "%1" to "% 1".
        // Example:
        // Source.......: "Send To:  %1"
        // Translates to: 'Enviar a:% 1'
        // Fix..........: 'Enviar a:%1'
        if(translation.translatedText.indexOf('% ') >= 0) {
          console.log(`dbg Fix Qt args b4 :'${translation.translatedText}'`);
          translation.translatedText = translation.translatedText.replace(/(\%)\s(?=\d)/g, ' $1')
          console.log(`dbg Fix Qt args aft:'${translation.translatedText}'`);
        }

        // return the translated text
        console.log(`translated '${sourceText}' to '${translation.translatedText}'`);

        if (translationNode === null ) {
          translationNode = doc.createElement('translation');
          message.appendChild(translationNode);
          translationNode.setAttribute('type', 'unfinished');
        }

        let textNode = translationNode.firstChild;
        if (textNode == null) {
          textNode = doc.createTextNode(translation.translatedText);
          translationNode.appendChild(textNode);
        } else {
          textNode.nodeValue = translation.translatedText;
        }

        translationNode.setAttribute('type', 'finished');

        callback(null, translation.translatedText);
      });
  return translateApiCallCount;
}

// Translate all context's found in Qt *.ts file
// Translate text from message/source message/translation
function translateQtTsFile(inputFileName, language) {
  console.log('******************************************************');
  console.log(` Translate to '${language}'`);
  console.log(`     ${inputFileName}`);
  console.log('******************************************************');
  // Get project name from input filename.
  // Example:  myproject_en.ts
  const pos = inputFileName.lastIndexOf('_');
  const filextensionLength = inputFileName.length - pos;
  if (pos < 0 || filextensionLength < 6) {
    console.log(
        `*** Errror: Unexpected input file name format: "${inputFileName}"`);
    return;
  }
  // const outputFilename = `${inputFileName.substring(0,
  // pos)}_${language}_output.ts`;
  const outputFilename = `${inputFileName}`;

  fs.readFile(inputFileName, 'utf-8', function(err, data) {
    if (err) {
      throw err;
    }
    const doc = new xmldom().parseFromString(data, 'application/xml');
    const tsElement = doc.getElementsByTagName('TS')[0];

    // language="en_US"
    // language="es_ES">
    // language="de_DE">
    let targetLanguage = getAttributeByName(tsElement, 'language');
    const pos = targetLanguage.indexOf('_');
    if(pos > 0) {
      targetLanguage = targetLanguage.substring(0, pos);
    }

    console.log('targetLanguage:', targetLanguage);

    const promises = [];
    const contextList = doc.getElementsByTagName('context');
    for (let i = 0; i < contextList.length; i += 1) {
      const context = contextList[i];
      const messageList = context.getElementsByTagName('message');
      for (let j = 0; j < messageList.length; j += 1) {
        const message = messageList[j];
        promises.push(new Promise((resolve, reject) => {
          // Translate text from message/source message/translation
          messageTranslate(
              targetLanguage, doc, message, function(err, translation) {
                if (err > 0) {
                  console.error(`** Error messageTranslate to '${language}' failed err:${err}`);
                  reject(err);
                } else {
                  resolve();
                }
              });
        }));
      }
    }  // end for context

    // Set timeout if a translation fail to complete
    // promises.push(new Promise((resolve, reject) => setTimeout(() => reject(1), 1*60*1000)));

    // When all strings are translated, write the translations to file
    Promise.all(promises)
        .then(() => {
          const xml = new XMLSerializer().serializeToString(doc);
          fs.writeFile(outputFilename, xml, function(err) {
            if (err) {
              // console.log(err);
              return console.log(err);
            }
          });
        })
        .catch(err => console.log(`*** Error Promise.all writing : ${outputFilename}\n${err}`));
  });
}

program.version('0.0.1')
    .description('Use Google Translate API to translate Qt Linguist TS files')
    .usage(
        '<googleTranslateApiKey> <workingFolder> <sourceLanguage>')
    .arguments(
        '<googleTranslateApiKey> <workingFolder> <sourceLanguage>',
        '\nUse Google Translate on Qt Linguist TS files')
    .action(function(
        googleTranslateApiKey, workingFolder, sourceLanguage,
        outputLanguageList) {
      _googleTranslateApiKey = googleTranslateApiKey;
      _workingFolder = workingFolder;
      _sourceLanguage = sourceLanguage;
    });

program.parse(process.argv);

const tsFileListPattern = `${_workingFolder}/*.ts`;
const tsFileList = glob.readdirSync(tsFileListPattern, {});
console.log('dbg tsFileList:', tsFileList);
if (!tsFileList.length) {
  console.error(
      `*** Error no Qt *.tsl files found in workingFolder: ${_workingFolder}`)
  return;
}

_googleTranslate = google(_googleTranslateApiKey);

console.log('sourceLanguage:', _sourceLanguage);
for (let i = 0; i < tsFileList.length; i += 1) {
  const tsFile = tsFileList[i];
  const xml = translateQtTsFile(tsFile, _sourceLanguage);
}

console.log('Exit');