import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import axios from '../utils/api';
import { toast } from 'sonner';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link as LinkIcon,
  Image as ImageIcon, Video, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Minus, Undo2, Redo2, Upload, Table as TableIcon,
  Paintbrush, Highlighter, Type, ChevronDown, Heading1, Heading2, Heading3,
  Heading4, Heading5, Heading6, Pilcrow, RemoveFormatting, FileCode
} from 'lucide-react';

const COLORS = [
  '#000000', '#374151', '#6B7280', '#DC2626', '#EA580C', '#D97706',
  '#16A34A', '#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#FFFFFF'
];

const ToolbarButton = ({ onClick, isActive, disabled, title, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-gray-200 mx-0.5" />;

const HeadingDropdown = ({ editor }) => {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'Paragraph', action: () => editor.chain().focus().setParagraph().run(), icon: Pilcrow, active: editor.isActive('paragraph') },
    { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: Heading1, active: editor.isActive('heading', { level: 1 }) },
    { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: Heading2, active: editor.isActive('heading', { level: 2 }) },
    { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: Heading3, active: editor.isActive('heading', { level: 3 }) },
    { label: 'Heading 4', action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), icon: Heading4, active: editor.isActive('heading', { level: 4 }) },
    { label: 'Heading 5', action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(), icon: Heading5, active: editor.isActive('heading', { level: 5 }) },
    { label: 'Heading 6', action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(), icon: Heading6, active: editor.isActive('heading', { level: 6 }) },
  ];
  const current = items.find(i => i.active) || items[0];
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-100 text-sm font-medium text-gray-700 min-w-[120px]">
        <current.icon className="w-4 h-4" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 ml-auto" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 w-48 py-1">
          {items.map(item => (
            <button key={item.label} type="button" onClick={() => { item.action(); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 ${item.active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ColorPicker = ({ editor, type }) => {
  const [open, setOpen] = useState(false);
  const Icon = type === 'highlight' ? Highlighter : Paintbrush;
  return (
    <div className="relative">
      <ToolbarButton onClick={() => setOpen(!open)} title={type === 'highlight' ? 'Highlight' : 'Text Color'} isActive={open}>
        <Icon className="w-4 h-4" />
      </ToolbarButton>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 p-2 grid grid-cols-6 gap-1 w-40">
          {COLORS.map(color => (
            <button key={color} type="button"
              onClick={() => {
                if (type === 'highlight') editor.chain().focus().toggleHighlight({ color }).run();
                else editor.chain().focus().setColor(color).run();
                setOpen(false);
              }}
              className="w-5 h-5 rounded border border-gray-200 hover:scale-125 transition-transform"
              style={{ backgroundColor: color }}
            />
          ))}
          <button type="button" onClick={() => {
            if (type === 'highlight') editor.chain().focus().unsetHighlight().run();
            else editor.chain().focus().unsetColor().run();
            setOpen(false);
          }} className="col-span-6 text-xs text-center py-1 hover:bg-gray-50 rounded text-gray-500">
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing your content...' }) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Link.configure({ openOnClick: false }),
      ImageExt.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: { class: 'w-full aspect-video rounded-lg my-4' },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[350px] p-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            uploadImage(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const uploadImage = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.url) {
        editor.chain().focus().setImage({ src: response.data.url }).run();
        toast.success('Image uploaded');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [editor]);

  const handleFileInput = (e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm" data-testid="rich-text-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50/80">
        <HeadingDropdown editor={editor} />
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ColorPicker editor={editor} type="color" />
        <ColorPicker editor={editor} type="highlight" />
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
          <FileCode className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          <span className="p-1.5 rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer inline-flex" title="Upload Image">
            <ImageIcon className="w-4 h-4" />
          </span>
        </label>
        <ToolbarButton onClick={() => { const u = window.prompt('Enter YouTube URL:'); if (u) editor.commands.setYoutubeVideo({ src: u }); }} title="YouTube Video">
          <Video className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Insert Table">
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => { const h = prompt('Paste HTML:'); if (h) editor.chain().focus().insertContent(h).run(); }} title="Insert HTML">
          <span className="text-xs font-mono font-bold">&lt;/&gt;</span>
        </ToolbarButton>
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Upload indicator */}
      {isUploading && (
        <div className="bg-blue-50 border-t border-blue-200 p-2 text-sm text-blue-600 flex items-center gap-2">
          <Upload className="w-4 h-4 animate-pulse" /> Uploading image...
        </div>
      )}

      {/* Footer hint */}
      <div className="text-xs text-gray-400 px-3 py-1.5 border-t bg-gray-50/50 flex items-center justify-between">
        <span>Drag & drop images into the editor. Select text for quick formatting.</span>
        <span>{editor.storage.characterCount?.characters?.() || ''}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
