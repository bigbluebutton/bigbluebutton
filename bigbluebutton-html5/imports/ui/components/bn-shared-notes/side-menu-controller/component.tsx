/* eslint-disable import/extensions */
import * as React from 'react';
import { SideMenuExtension } from '@blocknote/core/extensions';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import {
  AddBlockButton,
  DragHandleMenu,
  SideMenu,
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useExtension,
  useExtensionState,
} from '@blocknote/react';
import { MdDragIndicator } from 'react-icons/md';

function FocusingDragHandleButton({
  children,
  dragHandleMenu,
}: { children?: React.ReactNode; dragHandleMenu?: React.FC }) {
  const Components = useComponentsContext()!;
  const dict = useDictionary();
  const editor = useBlockNoteEditor();
  const sideMenu = useExtension(SideMenuExtension);
  const block = useExtensionState(SideMenuExtension, {
    selector: (state) => state?.block,
  });

  if (block === undefined) return null;

  const MenuComponent = dragHandleMenu || DragHandleMenu;

  const handleDragEnd = () => {
    sideMenu.blockDragEnd();
    setTimeout(() => editor.focus(), 0);
  };

  return (
    <Components.Generic.Menu.Root
      onOpenChange={(open: boolean) => {
        if (open) {
          sideMenu.freezeMenu();
        } else {
          sideMenu.unfreezeMenu();
          // Defer focus so the dropdown finishes closing before the editor receives it.
          setTimeout(() => editor.focus(), 0);
        }
      }}
      position="left"
    >
      <Components.Generic.Menu.Trigger>
        <Components.SideMenu.Button
          label={dict.side_menu.drag_handle_label}
          draggable
          onDragStart={(e) => sideMenu.blockDragStart(e, block)}
          onDragEnd={handleDragEnd}
          className="bn-button"
          icon={<MdDragIndicator size={24} data-test="dragHandle" />}
        />
      </Components.Generic.Menu.Trigger>
      <MenuComponent>{children}</MenuComponent>
    </Components.Generic.Menu.Root>
  );
}

export default function FocusRestoredSideMenu() {
  return (
    <SideMenu>
      <AddBlockButton />
      <FocusingDragHandleButton />
    </SideMenu>
  );
}
