import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  Indent as IndentIcon,
  Outdent as OutdentIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline as UnderlineIcon,
  Minus
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

const ToolButton = ({ onClick, isActive, disabled, title, icon }) => {
  const IconComp = icon;
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="glass-circle"
      size="icon-sm"
      className={`w-8 h-8 p-1.5 ${
        isActive
          ? 'bg-cyan-400/25 border-cyan-300/80 text-cyan-200 shadow-[0_0_16px_rgba(0,212,255,0.45),inset_0_2px_2px_rgba(255,255,255,0.85)] scale-105'
          : 'text-slate-300 hover:text-white'
      }`}
      title={title}
    >
      <IconComp className="w-3.5 h-3.5" />
    </Button>
  );
};

const Divider = () => <div className="w-px h-5 bg-white/20 mx-1 rounded-full" />;

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 p-3 border-b border-white/15 bg-white/[0.06] backdrop-blur-2xl flex-wrap">
      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)" icon={Bold} />
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)" icon={Italic} />
      <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)" icon={UnderlineIcon} />
      <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough" icon={Strikethrough} />
      <Divider />
      <ToolButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')} title="Paragraph" icon={Pilcrow} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1" icon={Heading1} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2" icon={Heading2} />
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3" icon={Heading3} />
      <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule" icon={Minus} />
      <Divider />
      <ToolButton onClick={() => editor.commands.indent()} title="Indent" icon={IndentIcon} />
      <ToolButton onClick={() => editor.commands.outdent()} title="Outdent" icon={OutdentIcon} />
      <Divider />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left" icon={AlignLeft} />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center" icon={AlignCenter} />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right" icon={AlignRight} />
      <ToolButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Align Justify" icon={AlignJustify} />
    </div>
  );
};

export default MenuBar;
