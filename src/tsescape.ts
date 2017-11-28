"use strict";

import * as vscode from "vscode";
import * as tscontext from "./tscontext";

export class Replacement {
    constructor(public readonly end: vscode.Position, public readonly replacement: string) {

    }
}

const escapeDoubleQuoted = (text: string, start: vscode.Position): Replacement => {
    let endCharacter: number = start.character;
    const replacement = text.replace(/["\\\n]|\r\n|./g, (match: string): string => {
        switch (match) {
            case "\"":
                endCharacter += 2;
                return "\\\"";
            case "\\":
                endCharacter += 2;
                return "\\\\";
            case "\r\n":
                endCharacter += 4;
                return "\\r\\n";
            case "\n":
                endCharacter += 2;
                return "\\n";
            default:
                endCharacter++;
                return match;
        }
    });

    return new Replacement(new vscode.Position(start.line, endCharacter), replacement);
};

const escapeQuoted = (text: string, start: vscode.Position): Replacement => {
    let endCharacter: number = start.character;
    const replacement = text.replace(/['\\\n]|\r\n|./g, (match: string): string => {
        switch (match) {
            case "'":
                endCharacter += 2;
                return "\\'";
            case "\\":
                endCharacter += 2;
                return "\\\\";
            case "\r\n":
                endCharacter += 4;
                return "\\r\\n";
            case "\n":
                endCharacter += 2;
                return "\\n";
            default:
                endCharacter++;
                return match;
        }
    });

    return new Replacement(new vscode.Position(start.line, endCharacter), replacement);
};

const escapeTemplateLiteral = (text: string, start: vscode.Position): Replacement => {
    let endCharacter = start.character;
    let endLine = start.line;

    const replacement = text.replace(/[`$\\\n]|\r\n|./g, (match: string): string => {
        switch (match) {
            case "`":
                endCharacter += 2;
                return "\\`";
            case "$":
                endCharacter += 2;
                return "\\$"; // or "$$" also valid (but that has intellisense issue with $${})
            case "\\":
                endCharacter += 2;
                return "\\\\";
            case "\n":
            case "\r\n":
                endCharacter = 0;
                endLine++;
                return "\n"; // actual line endings normalized by edit.replace later
            default:
                endCharacter++;
                return match;
        }
    });

    return new Replacement(new vscode.Position(endLine, endCharacter), replacement);
};

const escapeRegularExpressionLiteral = (text: string, start: vscode.Position): Replacement => {
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

    let endCharacter = start.character;

    const replacement = text.replace(/([-\/\\^$*+?.()|[\]{}\n])|\r\n|./g, (match: string, group1: string): string => {
        switch (match) {
            case "\r\n":
                endCharacter += 4;
                return "\\r\\n";
            case "\n":
                endCharacter += 2;
                return "\\n";
            default:
                if (typeof group1 === "string" && group1.length === 1) {
                    endCharacter += 2;
                    return "\\" + match;
                }

                endCharacter++;
                return match;
        }
    });

    return new Replacement(new vscode.Position(start.line, endCharacter), replacement);
};

export const escape = (text: string, start: vscode.Position, mode: tscontext.Context): Replacement => {
    switch (mode) {
        case tscontext.Context.quote:
            return escapeQuoted(text, start);
        case tscontext.Context.doubleQuote:
            return escapeDoubleQuoted(text, start);
        // aka template literals or string interpolation
        case tscontext.Context.backQuote:
            return escapeTemplateLiteral(text, start);
        case tscontext.Context.regularExpression:
            return escapeRegularExpressionLiteral(text, start);
        default:
            // intentionally does not reformat sub-fragments as existing code is likely already escaped
            // same if the pasted code contains surrounding quote marks
            return undefined;
    }
};
