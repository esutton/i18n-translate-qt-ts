# i18n-translate-qt-ts
Automatically translates Qt Linguist TS file to different languages via Google Translate API.

Note: Use requires a commercial Google API key.

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
````

## Working with Qt Translation

See: [qt-translation-example](https://github.com/esutton/qt-translation-example)

- For all displayed and printed string literals in you app use ````tr()````.
- The Qt lupdate will serach your project for all ````tr()```` and create *.ts files.
    - For example: 
        - ````tr("Hello %1 !").arg(nameFirst)````
    - http://doc.qt.io/qt-5/i18n-source-translation.html

1) Add languages you wish to support to your Qt project file (*.pro) and run qmake again
````
TRANSLATIONS += \
    languages/TranslationExample_en.ts  \
    languages/TranslationExample_de.ts
````

2) Use Qt lupdate to auto-generate your inital ts files.
   - From Qt Creator menu select:
       - Tools > External > Linguist > Update Translations (lupdate)

3) For each ````<message>```` found in each TSL file translate the ````<source>```` text and paste into ````<translation>````
    - Manually change ````translation/@type```` attribute from "unfinished" to "finished".
    - Or delete ````translation/@type```` attribute after translation.  
    - When you run lupdate again, it will removed all ````translation/@type=finished```` attributes
        - Missing type attribute is same as "finished"
        - Y
    - For small one-by-word projects, use free web browser Google Transalte.
        - https://translate.google.com/?
    - I made this node.js script that requires a commercial Google Trnaslate API key:
        - https://github.com/esutton/i18n-translate-qt-ts

4) Use Qt lrelease to generate compressed *.qm files from translated *.ts files
    - From Qt Creator menu select:
        - Tools > External > Linguist > Release Translations (lrelease)

5) Copy *.qm files to the embedded resource folder ./res/translation
   - ToDo: Add code to *.pro file to copy *.qm to ./res/translation

## Automated Translation Using Google Translate
### [i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts)

I created this [i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts) as a node.js command line utility.  

I was inspired by another github project used to auto-translate a react native app
* [i18n-translate-json](https://www.npmjs.com/package/i18n-translate-json)

Since this project was so helpful, I felt obligated to share [i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts).  
* Ulterior motive:  I was hoping someone in the community might help improve on it.

Use requires a commercial Google Translate API key:
- https://github.com/esutton/i18n-translate-qt-ts

To add translations to all ./languages/*.ts files in the [qt-translation-example](https://github.com/esutton/qt-translation-example) project:
````
# Use environment variable to store your API key
export API_KEY=AIzy0Vj...AIzy0VjQ
node index.js ${API_KEY} languages en
````

- Seems to work best if you process in small batches of one or two *.ts files.
    - Too many async queries active?
- If errors occur, you may need to run multiple times until all strings have translations.
    - Perhaps throttling the API calls might help this.
- If needed, send auto-translations to a native speaker for improvements.
    - [i18n-translate-qt-ts](https://github.com/esutton/i18n-translate-qt-ts) will not update 
    a manual translation unless ````translation/@type=unfinished```` 
    or source string is non-empty and ````<translation>```` is empty.

