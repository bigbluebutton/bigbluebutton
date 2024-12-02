import React from 'react';
import {
  useEditor, EditorContent, FloatingMenu, BubbleMenu,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const extensions = [StarterKit];

const content = '<p>Hello World!</p>';

const ChatRichTextEditor = () => {
  const editor = useEditor({
    extensions,
    content,
  });

  return (
    <>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </>
  );
};

export default ChatRichTextEditor;
