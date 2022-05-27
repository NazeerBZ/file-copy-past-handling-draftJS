/* eslint-disable @typescript-eslint/no-explicit-any */
import Editor from '@draft-js-plugins/editor';
import createImagePlugin from '@draft-js-plugins/image';
import {
  AtomicBlockUtils,
  convertFromRaw,
  EditorState,
  RichUtils,
} from 'draft-js';
import React, { useState } from 'react';

import Button from '@/components/buttons/Button';
const imagePlugin = createImagePlugin();
const plugins = [imagePlugin];

const initialState: any = {
  entityMap: {},
  blocks: [
    {
      key: '9gm3s',
      text: 'A sample example for file copy/past handling. Please try pasting your file here',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
};

const RichEditor = () => {
  const [editorState, setEditorState] = useState(
    // EditorState.createEmpty()
    EditorState.createWithContent(convertFromRaw(initialState))
  );
  const [pastedFile, setPastedFile] = useState<Blob>();
  const [showFile, toggleShowFile] = useState(false);

  const onEditorStateChange = (editorState: any) => {
    setEditorState(editorState);
  };

  const handleKeyCommand = (command: string) => {
    const updateEditorState: any = RichUtils.handleKeyCommand(
      editorState,
      command
    );

    if (updateEditorState) {
      setEditorState(updateEditorState);
      return 'handled';
    }

    return 'not-handled';
  };

  const onUnderlineClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'UNDERLINE'));
  };

  const onBoldClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  };

  const onItalicClick = () => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'));
  };

  const getBase64 = (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject('unable to read file');
    });
  };

  const handlePastedFiles = (files: Array<Blob>) => {
    const file = files[0];
    if (files) {
      // set state pasted file to show name on page
      setPastedFile(file);

      // convert file to base64 for entity
      getBase64(file)
        .then((base64) => {
          const updateEditorState = insertPastedFile(base64);
          setEditorState(updateEditorState);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
      return 'handled';
    }

    return 'not-handled';
  };

  const insertPastedFile = (base64: any) => {
    const currentContent = editorState.getCurrentContent();
    const contentWithEntity = currentContent.createEntity(
      'IMAGE',
      'IMMUTABLE',
      {
        src: base64,
      }
    );

    const entityKey = contentWithEntity.getLastCreatedEntityKey();
    const updateEditorState = EditorState.set(editorState, {
      currentContent: contentWithEntity,
    });

    return AtomicBlockUtils.insertAtomicBlock(
      updateEditorState,
      entityKey,
      ' '
    );
  };

  const onSubmit = () => {
    toggleShowFile(true);
  };

  return (
    <div>
      <Button
        variant='dark'
        className='customButton'
        onClick={onUnderlineClick}
      >
        U
      </Button>
      <Button variant='dark' className='customButton' onClick={onBoldClick}>
        B
      </Button>
      <Button variant='dark' className='customButton' onClick={onItalicClick}>
        I
      </Button>

      {showFile ? (
        <div className='uploadFile'>
          <span>Filename: </span>
          <span>{pastedFile?.name ?? 'N/A'}</span>
        </div>
      ) : null}
      <div className='editor'>
        <Editor
          editorState={editorState}
          onChange={onEditorStateChange}
          handleKeyCommand={handleKeyCommand}
          handlePastedFiles={handlePastedFiles}
          plugins={plugins}
        />
      </div>
      <Button variant='dark' className='submitBtn' onClick={onSubmit}>
        Submit
      </Button>
    </div>
  );
};

export default RichEditor;
