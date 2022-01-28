import { workspace, Selection, Position } from "vscode";

export const cursorStart = (selection: Selection): Position => {
    return selection.anchor.isBefore(selection.active)
                    ? selection.anchor
                    : selection.active;
};

export const cursorEnd = (selection: Selection): Position => {
    return selection.anchor.isAfter(selection.active)
                ? selection.anchor
                : selection.active;
};

export const getEnd = (appendedText: string, start: Position): Position => {
    if (!appendedText || appendedText.length === 0) {
        return start;
    }

    const lastLine = appendedText.lastIndexOf("\n");

    if (lastLine === -1) {
        return new Position(start.line, start.character + appendedText.length);
    }

    const lines: number = (appendedText.match(/[\n]/g) || []).length;

    return new Position(start.line + lines, appendedText.length - (lastLine + 1));
};

export type Maybe<T> = T | undefined;

export const coalesce = <T>(ctor: new() => T , ...args: Maybe<T>[]): T => {
    for (const arg of args) {
        if (arg !== undefined) {
            return arg;
        }
    }

    return new ctor();
};

export const bestValue = <T>(ctor: new() => T, section: string, key: string): T => {
    const config = workspace.getConfiguration(section);
    const setting = config.inspect(key);
    return coalesce<T>(ctor, setting.workspaceValue as T, setting.workspaceFolderValue as T, setting.globalValue as T, setting.defaultValue as T);
};
