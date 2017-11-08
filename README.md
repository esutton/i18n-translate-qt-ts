# i18n-translate-qt-ts
Automatically translates TS file format used by Qt Linguist to different languages via Google Translate API

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
https://www.qt.io/
A C++ based cross-platform SDK supporting desktops, embedded, Android, and iOS.

## [Qt Linguist](http://doc.qt.io/qt-5/qtlinguist-index.html)
http://doc.qt.io/qt-5/qtlinguist-index.html

### [Qt Linguist TS File Format](http://doc.qt.io/qt-5/linguist-ts-file-format.html)

http://doc.qt.io/qt-5/linguist-ts-file-format.html


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
          <source>Hola</source>
          <translation type="unfinished"></translation>
      </message>
  </context>
</TS>
````
