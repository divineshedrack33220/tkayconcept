"use client";

import { useRef, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Heading3, Quote, Code, Minus } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TOOLBAR_BUTTONS = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { type: "divider" },
  { command: "formatBlock", value: "H2", icon: Heading2, label: "Heading 2" },
  { command: "formatBlock", value: "H3", icon: Heading3, label: "Heading 3" },
  { command: "formatBlock", value: "P", icon: null, label: "Paragraph", text: "P" },
  { type: "divider" },
  { command: "insertUnorderedList", icon: List, label: "Bullet list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { command: "formatBlock", value: "BLOCKQUOTE", icon: Quote, label: "Quote" },
  { command: "formatBlock", value: "PRE", icon: Code, label: "Code block" },
  { command: "insertHorizontalRule", icon: Minus, label: "Divider" },
];

export function RichTextEditor({ value, onChange, placeholder = "Write product description...", rows = 6 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  }, []);

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {TOOLBAR_BUTTONS.map((btn, i) => {
          if ("type" in btn && btn.type === "divider") {
            return <div key={`d-${i}`} className="mx-1 h-5 w-px bg-gray-300" />;
          }
          const Icon = btn.icon;
          return (
            <button
              key={btn.label}
              type="button"
              onClick={() => execCommand(btn.command!, btn.value)}
              title={btn.label}
              className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700 active:bg-gray-300 transition-colors"
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold">{btn.text}</span>}
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`min-h-[${rows * 1.5}rem] px-3 py-2 text-sm text-gray-900 outline-none prose prose-sm max-w-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-3 [&_h3]:mb-1.5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-2 [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:font-mono [&_pre]:text-xs [&_hr]:border-gray-200 [&_hr]:my-4`}
        style={{ minHeight: `${rows * 1.5}rem` }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
