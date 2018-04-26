"use strict";

import * as tscontext from "./tscontext";

const escapeDoubleQuoted = (text: string): string => {
    return text.replace(/["\\\n\r]/g, (match: string): string => {
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
                throw new Error(`Unexpected match '${match}'`);
        }
    });
};

const escapeQuoted = (text: string): string => {
    return text.replace(/['\\\n\r]/g, (match: string): string => {
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
                throw new Error(`Unexpected match '${match}'`);
        }
    });
};

const escapeTemplateLiteral = (text: string): string => {
    return text.replace(/[`$\\]/g, (match: string): string => {
        switch (match) {
            case "`":
                return "\\`";
            case "$":
                return "\\$"; // or "$$" also valid (but that has intellisense issue with $${})
            case "\\":
                return "\\\\";
            default:
                return match;
        }
    });
};

const escapeRegularExpressionLiteral = (text: string): string => {
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

    return text.replace(/[-\/\\^$*+?.()|[\]{}\n\r]/g, (match: string): string => {
        switch (match) {
            case "\r":
                return "\\r";
            case "\n":
                return "\\n";
            default:
                return "\\" + match;
        }
    });
};

export const escape = (text: string, mode: tscontext.Context): string | undefined => {
    switch (mode) {
        case tscontext.Context.quote:
            return escapeQuoted(text);
        case tscontext.Context.doubleQuote:
            return escapeDoubleQuoted(text);
        // aka template literals or string interpolation
        case tscontext.Context.backQuote:
            return escapeTemplateLiteral(text);
        case tscontext.Context.regularExpression:
            return escapeRegularExpressionLiteral(text);
        default:
            // intentionally does not reformat sub-fragments as existing code is likely already escaped
            // same if the pasted code contains surrounding quote marks
            return undefined;
    }
};
