/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ISelectedSuggestion, SuggestWidget } from './suggestWidget';
import { CharacterSet } from 'vs/editor/common/core/characterClassifier';

export class CommitCharacterController {

	private readonly _disposables = new DisposableStore();

	private _active?: {
		readonly acceptCharacters: CharacterSet;
		readonly item: ISelectedSuggestion;
	};

	constructor(editor: ICodeEditor, widget: SuggestWidget, accept: (selected: ISelectedSuggestion) => any) {

		this._disposables.add(widget.onDidShow(() => this._onItem(editor, widget.getFocusedItem())));
		this._disposables.add(widget.onDidFocus((item) => this._onItem(editor, item), this));
		this._disposables.add(widget.onDidHide(this.reset, this));

		this._disposables.add(editor.onWillType(text => {
			if (this._active) {
				const ch = text.charCodeAt(text.length - 1);
				if (this._active.acceptCharacters.has(ch) && editor.getConfiguration().contribInfo.acceptSuggestionOnCommitCharacter) {
					accept(this._active.item);
				}
			}
		}));
	}

	private _onItem(editor: ICodeEditor, selected: ISelectedSuggestion | undefined): void {
		if (!selected) {
			this.reset();
			return;
		}

		if (this._active && this._active.item.item === selected.item) {
			// still the same item
			return;
		}

		// keep item and its commit characters
		const acceptCharacters = new CharacterSet();
		acceptCharacters.add(' '.charCodeAt(0));
		acceptCharacters.add('.'.charCodeAt(0));
		for (const ch of editor.getConfiguration().contribInfo.extraSuggestionCommitCharacters) {
			acceptCharacters.add(ch.charCodeAt(0));
		}
		for (const ch of selected.item.completion.commitCharacters || []) {
			if (ch.length > 0) {
				acceptCharacters.add(ch.charCodeAt(0));
			}
		}
		this._active = { acceptCharacters, item: selected };
	}

	reset(): void {
		this._active = undefined;
	}

	dispose() {
		this._disposables.dispose();
	}
}
