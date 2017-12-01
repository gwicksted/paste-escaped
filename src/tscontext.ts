"use strict";

import * as ts from "typescript";
import * as vscode from "vscode";

export const enum Context {
    code, // anywhere else
    quote, // 'quoted'
    doubleQuote, // "quoted"
    backQuote, // `${template} string`
    regularExpression, // literal: /[a-z]/
    multiComment, // comment /* ... */
    comment // comment // ...
}

// tslint:disable-next-line:interface-name
declare interface TypeScriptInternals {
    getTokenAtPosition(source: ts.SourceFile, offset: number): ts.Node;
}

export const getTypeScriptContext = (document: vscode.TextDocument, start: vscode.Position, end: vscode.Position): Context => {
    let ctx: Context = Context.code;

    let code: string = document.getText();

    const offset = document.offsetAt(start);
    const selectionEnd = document.offsetAt(end);

    if (selectionEnd > offset) {
        // drop selected text if any
        // this is done with the string instead of an edit to save an undo step and reduce flicker
        code = (offset > 0 ? code.substring(0, offset) : "") + (selectionEnd > offset ? code.substring(selectionEnd) : "");
    }

    const source = ts.createSourceFile(document.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    // hide your eyes!  This is not a public API.
    const internals: TypeScriptInternals = (ts as any as TypeScriptInternals);
    const token: ts.Node = internals.getTokenAtPosition(source, offset);

    switch (token.kind) {
        case ts.SyntaxKind.StringLiteral:
            // determine which quote character was used
            ctx = Context.doubleQuote;

            const tokenText: string = token.getText();
            if (tokenText.length > 0) {
                const quoteChar: string = tokenText[0];

                if (quoteChar === "'")  {
                    ctx = Context.quote;
                } else if (quoteChar === "\"") {
                    ctx = Context.doubleQuote;
                }
            }
        break;
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            ctx = Context.backQuote;
        break;
        case ts.SyntaxKind.EndOfFileToken:
        case ts.SyntaxKind.SemicolonToken:
            // handles similar cases (where | is the cursor position)
            // this is because comments are trivia (like whitespace) and it scans ahead to the next token
            // const abc = /*|*/;
            // const abc = /|/;

            const leading = token.getLeadingTriviaWidth();
            const leadingOffset = (offset - leading);
            const endOfLine = document.lineAt(start.line).range.end;
            const after = document.getText(new vscode.Range(start, endOfLine));

            if (leadingOffset > 0) {
                const rawTrivia = document.getText(new vscode.Range(document.positionAt(leadingOffset), start));
                let trivia: string = rawTrivia.trim();
                const rawLines = rawTrivia.split("\n");
                const lastLine = rawLines[rawLines.length - 1];

                while (trivia.length > 0) {
                    const slashSlash = lastLine.lastIndexOf("//");
                    const slashStar = trivia.lastIndexOf("/*");
                    const starSlash = trivia.lastIndexOf("*/");

                    // remove /* */ and continue processing
                    if (slashStar !== -1) {
                        if (starSlash !== -1) {
                            trivia = trivia.substring(0, slashStar) + trivia.substring(starSlash + 2);
                            continue;
                        } else {
                            ctx = Context.multiComment;
                            break;
                        }
                    } else if (slashSlash !== -1) {
                        // cursor positioned like this:
                        // const abc = ""; //|
                        ctx = Context.comment;
                        break;
                    } else if (rawTrivia.endsWith("/") && after.indexOf("/") === 0) {
                        // must be immediately following the first / otherwise this would be marked as a literal regular expression.
                        // const abc = /|/;
                        ctx = Context.regularExpression;
                        break;
                    } else {
                        ctx = Context.code;
                        break;
                    }
                }
            }

        break;
        case ts.SyntaxKind.RegularExpressionLiteral:
            ctx = Context.regularExpression;
        break;
        default:
            ctx = Context.code;
        break;
    }

    return ctx;
};
