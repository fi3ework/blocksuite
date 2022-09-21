import type { Quill, RangeStatic } from 'quill';
import type { Store } from '@building-blocks/store';
import { TextBlockProps } from '../..';
import type { EditableModel } from './rich-text';

interface BindingContext {
  collapsed: boolean;
  empty: boolean;
  offset: number;
  prefix: string;
  suffix: string;
  format: Record<string, unknown>;
}

type KeyboardBindings = Record<
  string,
  {
    key: string | number;
    handler: KeyboardBindingHandler;
    prefix?: RegExp;
    suffix?: RegExp;
    shortKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    ctrlKey?: boolean;
  }
>;

interface KeyboardEventThis {
  quill: Quill;
  options: {
    bindings: KeyboardBindings;
  };
}

type KeyboardBindingHandler = (
  this: KeyboardEventThis,
  range: RangeStatic,
  context: BindingContext
) => void;

export const createKeyboardBindings = (store: Store, model: EditableModel) => {
  const clientID = store.doc.clientID;

  function undo() {
    store.undo();
  }

  function redo() {
    store.redo();
  }

  function hardEnter(this: KeyboardEventThis) {
    const isAtBlockEnd =
      this.quill.getLength() - 1 === this.quill.getSelection()?.index;
    if (isAtBlockEnd) {
      const blockProps: Partial<TextBlockProps> = {
        flavour: 'text',
        text: '',
      };
      // make adding text block by enter a standalone operation
      store.captureSync();
      const id = store.addBlock(blockProps);
      setTimeout(() => {
        store.textAdapters.get(id)?.quill.focus();
      });
    }
  }

  function softEnter(this: KeyboardEventThis) {
    const index = this.quill.getSelection()?.index || 0;
    // @ts-ignore
    this.quill.insertText(index, '\n', clientID);
  }

  function indent(this: KeyboardEventThis) {
    if (model.flavour !== 'list') return;
    // TODO indent
  }

  function unindent(this: KeyboardEventThis) {
    if (model.flavour !== 'list') return;
    // TODO unindent
  }

  const keyboardBindings: KeyboardBindings = {
    undo: {
      key: 'z',
      shortKey: true,
      handler: undo,
    },
    redo: {
      key: 'z',
      shiftKey: true,
      shortKey: true,
      handler: redo,
    },
    hardEnter: {
      key: 'enter',
      handler: hardEnter,
    },
    softEnter: {
      key: 'enter',
      shiftKey: true,
      handler: softEnter,
    },
    tab: {
      key: 'tab',
      handler: indent,
    },
    shiftTab: {
      key: 'tab',
      shiftKey: true,
      handler: unindent,
    },
  };

  return keyboardBindings;
};