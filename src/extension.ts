"use strict";

import * as tscontext from "./tscontext";
import * as tsescape from "./tsescape";
import * as log from "./micrologger";
import { commands, workspace, TextEditor, Selection, TextEditorEdit, Range, ExtensionContext, Disposable } from "vscode";
import { Replacement } from "./tsescape";
import { bestValue, cursorStart, cursorEnd } from "./utils";

interface IConfig {
    readonly formatOnPaste: boolean;
    readonly selectAfter: boolean;
}

const getConfig = (): IConfig => {
    const config = workspace.getConfiguration("pasteEscaped");

    return {
        // editor.formatOnPaste currently is not able to be accessed without inspect? (otherwise gets an error)
        formatOnPaste: bestValue("editor", "formatOnPaste"),
        selectAfter: config.get("selectAfter", true)
    };
};

const pasteEscaped = async (editor: TextEditor): Promise<void> => {
    const cfg = getConfig();

    const start = cursorStart(editor.selection);
    const selectionEnd = cursorEnd(editor.selection);

    const mode: number = tscontext.getTypeScriptContext(editor.document, start, selectionEnd);

    // extensionHostProcess logs "Edits from command pasteEscaped.action were not applied." here
    await commands.executeCommand("editor.action.clipboardPasteAction");

    // paste will extend the cursor end position to the end of the pasted text
    const end = cursorEnd(editor.selection);
    const range: Range = new Range(start, end);
    const text: string = editor.document.getText(range);

    let replace: Replacement;

    try {
        replace = tsescape.escape(text, start, mode);
    } catch (e) {
        // paste already occurred normally, leave it at that.
        replace = undefined;
        log.error("Error encountered while escaping", e);
    }

    if (replace) {
        await editor.edit((edit: TextEditorEdit): void => {
            edit.replace(range, replace.replacement);
        });

        editor.selection = new Selection(start.line, start.character, replace.end.line, replace.end.character);
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

    disposables.push(commands.registerTextEditorCommand("pasteEscaped.action", async (editor: TextEditor): Promise<void> => {
        await pasteEscaped(editor);
    }));

    context.subscriptions.concat(disposables);
};
