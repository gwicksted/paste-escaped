# Paste Escaped

TypeScript Semantic Paste

_(escapes pasted text based on where the cursor is positioned)_

![paste-escaped][logo]

[logo]: https://github.com/gwicksted/paste-escaped/blob/master/paste.png?raw=true "Paste Escaped"

## Install

| Windows / Linux    | Mac               |
| ------------------ | ----------------- |
| `ctrl`+`shift`+`x` | `cmd`+`shift`+`x` |

* Type `Paste`
* Find `Paste Escaped`
* Click the `Install` button
* Click the `Reload` button

## Usage

### Paste with semantic escaping (TypeScript files only)

| Windows / Linux    | Mac               |
| ------------------ | ----------------- |
| `ctrl`+`shift`+`v` | `cmd`+`shift`+`v` |

### Undo semantic escaping

| Windows / Linux    | Mac              |
| ------------------ | ---------------- |
| `ctrl`+`z`         | `cmd`+`z`        |

* Press once to undo the _escaping_ (leaving you with the raw clipboard text).

* Press a second time to undo the entire paste operation.

### Command Pallette


| Windows / Linux    | Mac               |
| ------------------ | ----------------- |
| `ctrl`+`shift`+`p` | `cmd`+`shift`+`p` |

* Type `Paste`
* Select the option `Paste: Escaped`

## Features

Escapes clipboard text in the following scenarios with `|` being the cursor position:

:heavy_check_mark: ```const test = `|`;```

:heavy_check_mark: `const test = "|";`

:heavy_check_mark: `const test = '|';`

:heavy_check_mark: `const test = /|/g;`

:heavy_check_mark: `const test = 123; // |`

:heavy_check_mark: `const test = /* | */ 123;`

:ok_hand: `any.other.code |` (no escaping)

## How it works

Text in clipboard:

:clipboard:

```xml
<text property="${donteval}" folder="C:\temp"/>
<name first='John\`s' last="Tools"/>`
```

### Example 1. Pasting into template

```TypeScript
const abc = ``;
```

### Result (without extension) :thumbsdown:

```TypeScript
const abc = `<text property="${donteval}" folder="C:\temp"/>
<name first='John`s' last="Tools"/>`;
```

:warning: Considers `${donteval}` a template variable (may not be intentional)

:heavy_multiplication_x: Replaces `\t` in the `C:\\temp` path with a literal `TAB`

:heavy_multiplication_x: Breaks the string immediately following `John` causing compilation errors

### Result (with extension) :thumbsup:

```TypeScript
const abc = `<text property="\${donteval}" folder="C:\\temp"/>
<name first='John\`s' last="Tools"/>`;
```

:heavy_check_mark: The `${donteval}` exists as verbatim text and will not look for a variable named `donteval`

:heavy_check_mark: Does not replace part of the path with a `TAB`

:heavy_check_mark: The string ends where expected :astonished:

### Example 2.

```TypeScript
const def = "";
```

### Result (without extension) :thumbsdown:

```TypeScript
const def = "<text property="${donteval}" folder="C:\temp"/>
<name first='John`s' last="Tools"/>"
```

:heavy_multiplication_x: Breaks the string immediately following `property=` (and several other places) causing compilation errors

:heavy_multiplication_x: Adds a line break causing additional compilation errors

:heavy_multiplication_x: Replaces `\t` in the `C:\\temp` path with a literal `TAB`

### Result (with extension) :thumbsup:

```TypeScript
const def = "<text property=\"${donteval}\" path=\"C:\\temp\"/>\n<name first='John`s' last=\"Tools\"/>";
```

:heavy_check_mark: Escapes all quotes and backslashes (` \ `)

:heavy_check_mark: Escapes the line break with `\n` (or `\r\n` if that were on the clipboard)

:heavy_check_mark: The string ends where expected

# License

[MIT](LICENSE)
