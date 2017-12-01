"use strict";

import * as tscontext from "./tscontext";
import * as tsescape from "./tsescape";
import * as log from "./micrologger";
import * as vscode from "vscode";
import { commands, workspace, TextEditor, TextDocument, Selection, TextEditorEdit, Range, ExtensionContext, Disposable } from "vscode";
import { bestValue, cursorStart, cursorEnd, getEnd } from "./utils";

interface IConfig {
    readonly formatOnPaste: boolean;
    readonly selectAfter: boolean;
    readonly typeScript: string;
    readonly resolvedTypeScript: string;
}

const getConfig = (): IConfig => {
    const config = workspace.getConfiguration("pasteEscaped");

    return {
        // editor.formatOnPaste currently is not able to be accessed without inspect? (otherwise gets an error)
        formatOnPaste: bestValue(Boolean, "editor", "formatOnPaste") as boolean,
        selectAfter: config.get("selectAfter", true),
        typeScript: bestValue(String, "typescript", "tsdk") as string,
        resolvedTypeScript: require.resolve("typescript")
    };
};

const isTypeScript = (document: TextDocument): boolean => {
    return document.languageId === "typescript" || document.languageId === "typescriptreact";
};

const pasteEscaped = async (editor: TextEditor): Promise<void> => {
    const document = editor.document;

    // TODO: look at vscode.executeFormatDocumentProvider
    // vscode.executeHoverProvider
    // vscode.executeDocumentSymbolProvider
    // const symbols: vscode.SymbolInformation[] =
    //        ((await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", "uriofdocument")) as any as vscode.SymbolInformation[]);

    // TODO: consider editor.options.insertSpaces and editor.options.tabSize

    // TODO: use typescript.tsdk setting instead of bundling typescript
    // TODO: set ts.ScriptTarget based on tsconfig.json
    // TODO: use language services to reparse the source quickly -- is the AST available somehow?
    // ^ look at languages.registerHoverProvider

    if (!isTypeScript(document)) {
        await commands.executeCommand("editor.action.clipboardPasteAction");
        return;
    }

    const cfg = getConfig();

    const start = cursorStart(editor.selection);
    const selectionEnd = cursorEnd(editor.selection);

    const mode: number = tscontext.getTypeScriptContext(editor.document, start, selectionEnd);

    await commands.executeCommand("editor.action.clipboardPasteAction");

    // paste will extend the cursor end position to the end of the pasted text
    const end = cursorEnd(editor.selection);
    const range: Range = new Range(start, end);

    let replace: string;

    try {
        replace = tsescape.escape(document.getText(range), mode);
    } catch (e) {
        // paste already occurred normally, leave it at that.
        replace = undefined;
        log.error("Error encountered while escaping", e);
    }

    if (replace) {
        await editor.edit((edit: TextEditorEdit): void => {
            edit.replace(range, replace);
        });

        const replacementEnd = getEnd(replace, start);

        editor.selection = new Selection(start.line, start.character, replacementEnd.line, replacementEnd.character);
    }

    if (((mode === tscontext.Context.code) || !replace) && cfg.formatOnPaste && cfg.selectAfter) {
        try {
            await commands.executeCommand("editor.action.formatSelection");
        } catch (e) {
            // do nothing (throws if no configured selection formatter)
            log.error("Error encountered while formatting", e);
        }
    } else if (!cfg.selectAfter) {
        editor.selection = new Selection(end, end);
    }
};

export const activate = (context: ExtensionContext): void => {
    const disposables: Disposable[] = [];

    log.setExtensionName("paste-escaped");
    log.debug("Activated");

    disposables.push(commands.registerCommand("pasteEscaped.action", (): void => {
        pasteEscaped(vscode.window.activeTextEditor).then((): void => {
            log.trace("escaped paste");
        });
    }));

    context.subscriptions.concat(disposables);
};
