# i18n-translate-qt-ts
Automatically translates Qt Linguist TS file to different languages via Google Translate API

Usage:
````
i18n-translate-qt-ts <googleTranslateApiKey> <workingFolder> <inputLanguage>
````

* ````<googleTranslateApiKey>```` - Your commercial Google Translate API key
* ````<workingFolder>```` - Folder containing your Qt *.ts files
* ````<sourceLanguage>```` - Source strings language abbreviation, for example, 'en'

Example:
````
i18n-translate-qt-ts myLongSecretApiKey app/i18n en
````

# [Qt](https://www.qt.io/)
A C++ based cross-platform SDK supporting desktops, embedded, Android, and iOS.
* https://www.qt.io/

## [Qt Linguist](http://doc.qt.io/qt-5/qtlinguist-index.html)
* http://doc.qt.io/qt-5/qtlinguist-index.html

### [Qt Linguist TS File Format](http://doc.qt.io/qt-5/linguist-ts-file-format.html)
* http://doc.qt.io/qt-5/linguist-ts-file-format.html

#### Example

##### Before Translation
File: myproject_es.ts
````
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="es">
  <context>
      <name>QPushButton</name>
      <message>
          <source>Hello</source>
          <translation type="unfinished"></translation>
      </message>
  </context>
</TS>
````

##### After Translation
File: myproject_es.ts
````
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE TS>
<TS version="2.0" language="es">
  <context>
      <name>QPushButton</name>
      <message>
          <source>Hello mother</source>
          <translation type="finished">Hola madre</translation>          
      </message>
  </context>
</TS>
````

# Development - Getting Started
````
git clone https://github.com/esutton/i18n-translate-qt-ts.git i18n-translate-qt-ts/source
cd 18n-translate-qt-ts/source
yarn
npm install -g

# Check global installed packages
npm list -g --depth=0

# Use environment variable to store your API key
export API_KEY=AIzy0Vj...

# Generate German (de.ts) and Spanish (es.ts) translations 
# from English (*_en.ts) file 
# found in folder test/i18n..

node index.js ${API_KEY} test/simple/unfinished en
```