"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Copy, Check, Plus, Trash2, FileText, AlertCircle, Shield, CheckCircle2, X } from "lucide-react";

export interface EnvItem {
  id?: string;
  key: string;
  value: string;
}

export interface EnvEditorProps {
  title?: string;
  description?: string;
  defaultValue?: EnvItem[];
  value?: EnvItem[];
  onChange?: (items: EnvItem[]) => void;
  placeholderKey?: string;
  placeholderValue?: string;
  className?: string;
  readOnly?: boolean;
  itemBadges?: Record<number, { text: string; variant?: 'success' | 'warning' | 'error' | 'neutral' }>;
  defaultKeyPrefix?: string;
}

/**
 * Parses raw .env string content into array of { key, value }
 */
export function parseEnv(raw: string, defaultKeyPrefix = "TOKEN"): EnvItem[] {
  if (!raw || typeof raw !== "string") return [];
  const lines = raw.split(/\r?\n/);
  const items: EnvItem[] = [];
  let unnamedCount = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comment lines
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Remove leading 'export ' if present
    const cleanLine = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;

    const equalIndex = cleanLine.indexOf("=");
    if (equalIndex !== -1) {
      let key = cleanLine.slice(0, equalIndex).trim().toUpperCase();
      let val = cleanLine.slice(equalIndex + 1).trim();

      // Unquote value if wrapped in single or double quotes
      if (
        (val.startsWith('"') && val.endsWith('"') && val.length >= 2) ||
        (val.startsWith("'") && val.endsWith("'") && val.length >= 2)
      ) {
        val = val.slice(1, -1);
      }

      if (key) {
        items.push({
          id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          key,
          value: val
        });
      }
    } else {
      // If user pasted raw values without key (e.g. bulk tokens)
      items.push({
        id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        key: `${defaultKeyPrefix}_${unnamedCount++}`,
        value: cleanLine
      });
    }
  }

  return items;
}

/**
 * Formats an array of EnvItem back into a .env string
 */
export function formatEnv(items: EnvItem[]): string {
  if (!Array.isArray(items)) return "";
  return items
    .filter(item => item && (item.key.trim() || item.value.trim()))
    .map(item => `${item.key.trim().toUpperCase()}=${item.value}`)
    .join("\n");
}

export function EnvEditor({
  title = "Environment variables",
  description = "Available to builds and at runtime in Production.",
  defaultValue,
  value,
  onChange,
  placeholderKey = "VARIABLE_NAME",
  placeholderValue = "Value",
  className = "",
  readOnly = false,
  itemBadges,
  defaultKeyPrefix = "UPCLOUD_API_TOKEN"
}: EnvEditorProps) {
  const isControlled = value !== undefined;
  const initialItems = (value || defaultValue || []).map((item, idx) => ({
    id: item.id || `env-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    key: item.key || "",
    value: item.value || ""
  }));

  const [internalItems, setInternalItems] = useState<EnvItem[]>(
    initialItems.length > 0 ? initialItems : [{ id: "env-init-0", key: `${defaultKeyPrefix}_1`, value: "" }]
  );

  const [showAll, setShowAll] = useState<boolean>(false);
  const [showIndividual, setShowIndividual] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState<boolean>(false);
  const [pasteContent, setPasteContent] = useState<string>("");

  // Sync internal items when controlled value changes
  useEffect(() => {
    if (isControlled && value) {
      setInternalItems(
        value.map((item, idx) => ({
          id: item.id || `env-ctrl-${idx}-${item.key}`,
          key: item.key || "",
          value: item.value || ""
        }))
      );
    }
  }, [value, isControlled]);

  const currentItems = isControlled && value ? value : internalItems;

  const triggerChange = (newItems: EnvItem[]) => {
    if (!isControlled) {
      setInternalItems(newItems);
    }
    onChange?.(newItems);
  };

  // Find duplicate keys for validation
  const keyCounts = currentItems.reduce((acc, item) => {
    const k = item.key.trim().toUpperCase();
    if (k) {
      acc[k] = (acc[k] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleKeyChange = (index: number, newKey: string) => {
    const sanitized = newKey.replace(/[^A-Za-z0-9_]/g, "_").toUpperCase();
    const updated = currentItems.map((item, i) => (i === index ? { ...item, key: sanitized } : item));
    triggerChange(updated);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updated = currentItems.map((item, i) => (i === index ? { ...item, value: newValue } : item));
    triggerChange(updated);
  };

  const handleAddVariable = () => {
    const nextIndex = currentItems.length + 1;
    const newItem: EnvItem = {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      key: `${defaultKeyPrefix}_${nextIndex}`,
      value: ""
    };
    triggerChange([...currentItems, newItem]);
  };

  const handleRemoveVariable = (index: number) => {
    if (currentItems.length <= 1) {
      // Clear row instead of removing if last one
      triggerChange([{ ...currentItems[0], value: "" }]);
      return;
    }
    const updated = currentItems.filter((_, i) => i !== index);
    triggerChange(updated);
  };

  const toggleShowIndividual = (itemId: string) => {
    setShowIndividual(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleCopyEnv = () => {
    const text = formatEnv(currentItems);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle pasting multi-line env directly into any key input
  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes("\n") || pasted.includes("=")) {
      e.preventDefault();
      const parsed = parseEnv(pasted, defaultKeyPrefix);
      if (parsed.length > 0) {
        // Splice or append parsed items
        const before = currentItems.slice(0, index);
        const after = currentItems.slice(index + 1);
        const combined = [...before, ...parsed, ...after];
        triggerChange(combined);
      }
    }
  };

  const handleApplyPasteModal = (mode: 'replace' | 'append') => {
    const parsed = parseEnv(pasteContent, defaultKeyPrefix);
    if (parsed.length === 0) return;

    if (mode === 'replace') {
      triggerChange(parsed);
    } else {
      triggerChange([...currentItems, ...parsed]);
    }
    setIsPasteModalOpen(false);
    setPasteContent("");
  };

  return (
    <div className={`w-full rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950/80 p-5 sm:p-7 shadow-2xl backdrop-blur-md transition-all ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              {title}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              {currentItems.length} {currentItems.length === 1 ? 'Token / Var' : 'Tokens / Vars'}
            </span>
          </div>
          {description && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Show / Hide all */}
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {showAll ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{showAll ? "Hide all" : "Show all"}</span>
          </button>

          {/* Copy .env */}
          <button
            type="button"
            onClick={handleCopyEnv}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? "Copied!" : "Copy .env"}</span>
          </button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="py-4 space-y-3">
        {currentItems.map((item, index) => {
          const itemId = item.id || `item-${index}`;
          const isValueVisible = showAll || !!showIndividual[itemId];
          const isDuplicate = (keyCounts[item.key.trim().toUpperCase()] || 0) > 1;
          const badge = itemBadges?.[index];

          return (
            <div
              key={itemId}
              className="group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700/80 transition-all"
            >
              {/* Failover / Priority order index indicator */}
              <div className="hidden lg:flex items-center justify-center w-6 text-center">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  index === 0
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400'
                }`} title={index === 0 ? "Prioritas Utama (Primary)" : `Failover Cadangan #${index}`}>
                  #{index + 1}
                </span>
              </div>

              {/* Key Input */}
              <div className="w-full sm:w-[38%] md:w-[35%] relative">
                <input
                  type="text"
                  value={item.key}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  onPaste={(e) => handleKeyPaste(e, index)}
                  disabled={readOnly}
                  placeholder={placeholderKey}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border text-xs sm:text-sm font-mono tracking-wide text-white placeholder-slate-600 focus:outline-none transition-all ${
                    isDuplicate
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                      : "border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                  }`}
                />
                {isDuplicate && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-rose-400 text-[10px]" title="Nama variabel duplikat">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Value Input with Eye Toggle */}
              <div className="flex-1 relative">
                <input
                  type={isValueVisible ? "text" : "password"}
                  value={item.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  disabled={readOnly}
                  placeholder={placeholderValue}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => toggleShowIndividual(itemId)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title={isValueVisible ? "Sembunyikan Nilai" : "Tampilkan Nilai"}
                >
                  {isValueVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Badges if any (e.g. test connection status) */}
              {badge && (
                <div className="self-center sm:self-auto shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide uppercase ${
                      badge.variant === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : badge.variant === 'error'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : badge.variant === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {badge.variant === 'success' && <CheckCircle2 className="w-3 h-3" />}
                    {badge.variant === 'error' && <AlertCircle className="w-3 h-3" />}
                    {badge.text}
                  </span>
                </div>
              )}

              {/* Delete Row Button */}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariable(index)}
                  className="self-end sm:self-center p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                  title="Hapus variabel ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddVariable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add variable</span>
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              onClick={() => setIsPasteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Paste .env</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          Tip: paste several lines into any name field to import them.
        </p>
      </div>

      {/* Paste .env Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Import / Paste .env</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Tempel baris-baris token atau format <code>KEY=VALUE</code> dari file .env Anda. Baris kosong dan komentar (<code>#</code>) akan diabaikan.
            </p>

            <textarea
              rows={8}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder={`# Contoh multi-token UpCloud failover:\nUPCLOUD_API_TOKEN_1=ucat_xxxxxxxxxxxxxxx\nUPCLOUD_API_TOKEN_2=ucat_yyyyyyyyyyyyyyy\nUPCLOUD_API_TOKEN_3=ucat_zzzzzzzzzzzzzzz`}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-y"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPasteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleApplyPasteModal('append')}
                disabled={!pasteContent.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Tambahkan (Append)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPasteModal('replace')}
                disabled={!pasteContent.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 cursor-pointer disabled:opacity-50"
              >
                Ganti Semua (Replace)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
