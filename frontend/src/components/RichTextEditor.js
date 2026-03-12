import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import axios from '../utils/api';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Video, Link as LinkIcon } from 'lucide-react';

const RichTextEditor = ({ content, onChange }) => {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg my-4',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
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

  const uploadImage = async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.url) {
        editor.chain().focus().setImage({ src: response.data.url }).run();
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const addImageFromUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYouTubeVideo = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
        >
          <s>S</s>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('paragraph') ? 'bg-gray-300' : ''}`}
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 4 }) ? 'bg-gray-300' : ''}`}
          title="Heading 4"
        >
          H4
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
        >
          " Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1 rounded hover:bg-gray-200"
        >
          ―
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* NEW: Image upload button */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            type="button"
            className="px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
            title="Upload Image"
            onClick={(e) => e.preventDefault()}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">Image</span>
          </button>
        </label>
        
        {/* NEW: Image from URL button */}
        <button
          type="button"
          onClick={addImageFromUrl}
          className="px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
          title="Image from URL"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-sm">URL</span>
        </button>
        
        {/* NEW: Video embed button */}
        <button
          type="button"
          onClick={addYouTubeVideo}
          className="px-3 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
          title="Embed YouTube Video"
        >
          <Video className="w-4 h-4" />
          <span className="text-sm">Video</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-3 py-1 rounded hover:bg-gray-200"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-3 py-1 rounded hover:bg-gray-200"
        >
          ↷ Redo
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => {
            const html = prompt('Enter HTML code:');
            if (html) {
              editor.chain().focus().insertContent(html).run();
            }
          }}
          className="px-3 py-1 rounded hover:bg-gray-200 bg-yellow-50 border border-yellow-300 text-yellow-800 font-medium"
          title="Insert HTML (for forms, scripts, iframes, etc.)"
        >
          &lt;/&gt; HTML
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
      />
      
      {/* Upload indicator */}
      {isUploading && (
        <div className="bg-blue-50 border-t border-blue-200 p-2 text-sm text-blue-600 flex items-center gap-2">
          <Upload className="w-4 h-4 animate-pulse" />
          Uploading image...
        </div>
      )}
      
      {/* Drop zone indicator */}
      <div className="text-xs text-gray-500 p-2 border-t bg-gray-50">
        💡 Tip: You can drag and drop images directly into the editor
      </div>
    </div>
  );
};

export default RichTextEditor;
