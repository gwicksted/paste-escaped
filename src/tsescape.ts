"use strict";

import * as tscontext from "./tscontext";

const tab: number = 9;

const escapeSpecialCharacter = (c: string): string => {

    const charCode = c.charCodeAt(0);
    if (charCode !== tab) {

        const ch = charCode.toString(16);
        const hex = "0000".substring(0, 4 - ch.length) + ch;

        return `\\u${hex}`;
    }

    return c;
};

const escapeDoubleQuoted = (text: string, escapeNonAnsi7: boolean): string => {
    return text.replace(/["\\\n\r\u0000-\u0019\u007f-\uffff]/g, (match: string): string => {
        switch (match) {
            case "\"":
                return "\\\"";
            case "\\":
                return "\\\\";
            case "\r":
                return "\\r";
            case "\n":
                return "\\n";
            default:
                return escapeNonAnsi7 ? escapeSpecialCharacter(match) : match;
        }
    });
};

const escapeQuoted = (text: string, escapeNonAnsi7: boolean): string => {
    return text.replace(/['\\\n\r\u0000-\u0019\u007f-\uffff]/g, (match: string): string => {
        switch (match) {
            case "'":
                return "\\'";
            case "\\":
                return "\\\\";
            case "\r":
                return "\\r";
            case "\n":
                return "\\n";
            default:
                return escapeNonAnsi7 ? escapeSpecialCharacter(match) : match;
        }
    });
};

const escapeTemplateLiteral = (text: string, escapeNonAnsi7: boolean): string => {
    return text.replace(/[`$\\\u0000-\u0019\u007f-\uffff]/g, (match: string): string => {
        switch (match) {
            case "`":
                return "\\`";
            case "$":
                return "\\$"; // or "$$" also valid (but that has intellisense issue with $${})
            case "\\":
                return "\\\\";
            default:
                return escapeNonAnsi7 ? escapeSpecialCharacter(match) : match;
        }
    });
};

const escapeRegularExpressionLiteral = (text: string, escapeNonAnsi7: boolean): string => {
    // TODO: contextual escaping
    // context = character group:
    //   beginning of expression (if first char) ^
    //   range - (unless first char or last char)
    //   still escape \ and \r\n
    //   do not escape *.$[{}|+?/
    // context = {}
    //   only certain values allowed (digits and comma)
    // otherwise escape:
    //   \/.^$[]()?|+*{}\r\n

    // TODO: escape \t and unicode sequences

    // if pasting into a string to be passed to RegExp, drop / escaping but perform rest of regex escape
    // then perform a quote escape.

    // what about multi-line regex flag or ignore whitespace flag?
    // what about collapsing whitespace into \s+ or \s* (convenience setting)
    // what about trimming leading/trailing whitespace (convenience setting)

    return text.replace(/[-\/\\^$*+?.()|[\]{}\n\r\u0000-\u0019\u007f-\uffff]/g, (match: string): string => {
        switch (match) {
            case "\r":
                return "\\r";
            case "\n":
                return "\\n";
            case "-":
            case "/":
            case "\\":
            case "^":
            case "$":
            case "*":
            case "+":
            case "?":
            case ".":
            case "(":
            case ")":
            case "|":
            case "[":
            case "]":
            case "{":
            case "}":
                return "\\" + match;

            default:
                return escapeNonAnsi7 ? escapeSpecialCharacter(match) : match;
        }
    });
};

export const escape = (text: string, mode: tscontext.Context, escapeNonAnsi7: boolean): string | undefined => {
    switch (mode) {
        case tscontext.Context.quote:
            return escapeQuoted(text, escapeNonAnsi7);
        case tscontext.Context.doubleQuote:
            return escapeDoubleQuoted(text, escapeNonAnsi7);
        // aka template literals or string interpolation
        case tscontext.Context.backQuote:
            return escapeTemplateLiteral(text, escapeNonAnsi7);
        case tscontext.Context.regularExpression:
            return escapeRegularExpressionLiteral(text, escapeNonAnsi7);
        default:
            // intentionally does not reformat sub-fragments as existing code is likely already escaped
            // same if the pasted code contains surrounding quote marks
            return undefined;
    }
};
