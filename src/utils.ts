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

export type MaybeBoolean = boolean | undefined;

export const coalesce = (...args: MaybeBoolean[]): boolean => {
    for (const arg of args) {
        if (typeof arg === "boolean") {
            return arg;
        }
    }

    return false;
};

export const bestValue = (section: string, key: string): boolean => {
    const config = workspace.getConfiguration(section);
    const setting = config.inspect(key);
    return coalesce(setting.workspaceValue, setting.workspaceFolderValue, setting.globalValue, setting.defaultValue);
};
