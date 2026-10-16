import React, { useState, useRef } from 'react';
import { FormattedMarkdown } from './FormattedMarkdown';
import { 
  Bold, 
  Italic, 
  Heading3, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Link2, 
  Eye, 
  Edit3,
  FileCode,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ChangelogMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  previewTitle?: string;
  previewType?: 'feature' | 'improvement' | 'fix';
  previewDate?: string;
}

export const ChangelogMarkdownEditor: React.FC<ChangelogMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan deskripsi lengkap atau rincian pembaruan di sini...\nDukungan formatting teks: **tebal**, *miring*, `kode`, bullet list (-), dan heading (###).',
  previewTitle,
  previewType = 'feature',
  previewDate
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string = '', placeholderText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholderText;

    const replacement = `${prefix}${textToInsert}${suffix}`;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        const cursorLoc = start + prefix.length + textToInsert.length;
        textarea.setSelectionRange(cursorLoc, cursorLoc);
      }
    }, 10);
  };

  return (
    <div className="space-y-2">
      {/* Editor & Preview Header Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="size-3.5" />
            <span>Tulis (Editor)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="size-3.5" />
            <span>Pratinjau (Preview)</span>
          </button>
        </div>

        {/* Cheatsheet Toggle */}
        <button
          type="button"
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
          title="Panduan format teks"
        >
          <HelpCircle className="size-3.5" />
          <span>Panduan Format</span>
        </button>
      </div>

      {/* Cheatsheet Helper Drawer */}
      {showCheatsheet && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-cyan-500" />
              Sintaks Format Teks Cepat
            </span>
            <button
              type="button"
              onClick={() => setShowCheatsheet(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">**Tebal**</span>: Teks bold</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">*Miring*</span>: Teks italic</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">`kode`</span>: Inline code</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">### Judul</span>: Subheading</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">- Poin</span>: Bullet list</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">1. Poin</span>: List bernomor</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">&gt; Kutipan</span>: Callout/quote</div>
            <div><span className="text-cyan-600 dark:text-cyan-400 font-bold">[Teks](url)</span>: Link web</div>
          </div>
        </div>
      )}

      {/* Mode 1: Editor View */}
      {activeTab === 'write' ? (
        <div className="space-y-2">
          {/* Format Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => insertFormat('**', '**', 'teks tebal')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tebal (Bold) - **teks**"
            >
              <Bold className="size-3.5 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('*', '*', 'teks miring')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Miring (Italic) - *teks*"
            >
              <Italic className="size-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => insertFormat('### ', '\n', 'Judul Bagian')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sub-judul (H3) - ### Judul"
            >
              <Heading3 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('- ', '\n', 'Poin pembaruan')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Daftar Poin (Bullet List) - - Poin"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('1. ', '\n', 'Langkah pertama')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Daftar Bernomor (Numbered List) - 1. Poin"
            >
              <ListOrdered className="size-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => insertFormat('`', '`', 'kode_inline')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kode Inline - `kode`"
            >
              <Code className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('```\n', '\n```\n', '// Tulis blok kode di sini')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Blok Kode - ```code```"
            >
              <FileCode className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('> ', '\n', 'Catatan penting pembaruan')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kutipan / Callout - > Kutipan"
            >
              <Quote className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat('[', '](https://...)', 'Teks Tautan')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tautan / Link - [Nama](url)"
            >
              <Link2 className="size-3.5" />
            </button>
          </div>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner leading-relaxed resize-y"
          />
        </div>
      ) : (
        /* Mode 2: Live Preview Card */
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-cyan-500/30 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="size-3.5 text-cyan-500" />
              Pratinjau Tampilan Rilis Publik
            </span>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
              Live Preview
            </span>
          </div>

          {/* Simulated Card Preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                previewType === 'feature'
                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                  : previewType === 'improvement'
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
              }`}>
                {previewType === 'feature' ? '+ New Feature' : previewType === 'improvement' ? '⚡ Improvement' : '🐛 Bug Fix'}
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {previewDate || 'Today'}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {previewTitle || 'Judul Pembaruan Akan Muncul di Sini...'}
            </h4>

            {/* Formatted Content */}
            {value.trim() ? (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <FormattedMarkdown content={value} />
              </div>
            ) : (
              <p className="text-xs italic text-slate-400 dark:text-slate-500">
                Belum ada deskripsi rinci. Masukkan teks berformat di tab "Tulis" untuk melihat pratinjaunya di sini.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangelogMarkdownEditor;
