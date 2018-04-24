# i18n-translate-qt-ts
Automatically translates Qt Linguist TS file to different languages via Google Translate API

Usage:
````
i18n-translate-qt-ts <googleTranslateApiKey> <workingFolder> <inputLanguage> <outputLanguageList>
````

* <googleTranslateApiKey> - Your Google Translate API key
* <workingFolder> - Input and output folder containing your input language TS file
* <inputLanguage> - Input language abbreviation, for example, en
* <outputLanguageList> - One or more output language abbreviation separated by comma

Example:
````
i18n-translate-qt-ts myLongSecretApiKey app/i18n en cs,da,de,es,fr,nl,pl,sv
````

# [Qt](https://www.qt.io/)
A C++ based cross-platform SDK supporting desktops, embedded, Android, and iOS.
* https://www.qt.io/

## [Qt Linguist](http://doc.qt.io/qt-5/qtlinguist-index.html)
* http://doc.qt.io/qt-5/qtlinguist-index.html

### [Qt Linguist TS File Format](http://doc.qt.io/qt-5/linguist-ts-file-format.html)
* http://doc.qt.io/qt-5/linguist-ts-file-format.html

#### Base Language en
````
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="en">
  <context>
      <name>QPushButton</name>
      <message>
          <source>Hello</source>
          <translation type="unfinished"></translation>
      </message>
  </context>
</TS>
````

#### Translation es
````
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="es">
  <context>
      <name>QPushButton</name>
      <message>
          <source>Hello</source>
          <translation>Hola</translation>
      </message>
  </context>
</TS>
````

# Development
````
git clone https://github.com/esutton/i18n-translate-qt-ts.git i18n-translate-qt-ts/source
cd 18n-translate-qt-ts/source
yarn
npm install -g

export API_KEY=AIzy0Vj...

# Execute:
node index.js ${API_KEY} test/i18n en cs,da,de,es
````

# ToDo:

1) Iterate through test/i8n/tsr_en.ts
2) Get all /message/source/ text
3) Replace /message/translation/ text

See:
* https://github.com/jindw/xmldom/issues/99
* 