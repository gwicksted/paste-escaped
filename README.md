# Paste Escaped
![paste-escaped](/paste.png?raw=true "Paste Escaped")

VSCode Semantic Paste into **TypeScript** code with proper escaping based on where the caret is positioned.

## Features

Works with the following scenarios (where `|` is the cursor position):

* Cursor within double quotes: `const test = \`|\`;`
* Cursor within single quotes: `const test = '|';`
* Cursor within a literal regular expression: `const test = /|/g;`
* Cursor within a single-line comment: `const test = 123; // |`
* Cursor within a multi-line comment: `const test = /* | */ 123;
* Cursor anywhere else in code (no escaping)

## How it works

Example text in clipboard:

```xml
<text property="${donteval}" folder="C:\temp"/>
<name first='John\`s' last="Tools"/>`
```

### Example 1.

```TypeScript
const abc = ``;
```

### Result (without extension) :thumbsdown:

```TypeScript
const abc = `<text property="${donteval}" folder="C:\temp"/>
<name first='John`s' last="Tools"/>`
```

* Considers `${donteval}` a template variable (may not be intentional)
* Replaces `\t` in the `C:\\temp` path with a literal `TAB`
* Breaks the string immediately following `John` causing compilation errors

### Result (with extension) :thumbsup:

```TypeScript
const abc = `<text property="$${donteval}" folder="C:\\temp"/>
<name first='John\`s' last="Tools"/>`;
```

* The `${donteval}` exists as verbatim text and will not look for a variable named `donteval`
* Does not replace part of the path with a `TAB`
* The string ends where expected

### Example 2.

```TypeScript
const def = "";
```

### Result (without extension) :thumbsdown:

```TypeScript
const def = "<text property="${donteval}" folder="C:\temp"/>
<name first='John`s' last="Tools"/>"
```

* Breaks the string immediately following `property=` (and several other places) causing compilation errors
* Adds a line break causing additional compilation errors
* Replaces `\t` in the `C:\\temp` path with a literal `TAB`

### Result (with extension) :thumbsup:

```TypeScript
const def = "<text property=\"${donteval}\" path=\"C:\\temp\"/>\n<name first='John`s' last=\"Tools\"/>";
```

* Escapes all quotes and backslashes (` \ `)
* Escapes the line break with `\n` (or `\r\n` if that were on the clipboard)
* The string ends where expected

# License

* All code - [MIT](LICENSE)
* `paste-icon.png` - [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) see below for attribution.

# Icon

Special thanks to [game-icons.net](http://game-icons.net) for providing free high-quality icons like the [paint-bucket](http://game-icons.net/delapouite/originals/paint-bucket.html).
