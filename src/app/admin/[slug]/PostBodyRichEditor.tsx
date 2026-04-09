"use client";

import { useEffect, useRef, useState } from "react";

import { postBodyToTextareaValue } from "@/lib/post-body-html";

type PostBodyRichEditorProps = {
  initialBody: string;
  onHtmlChange: (html: string) => void;
};

export function PostBodyRichEditor({
  initialBody,
  onHtmlChange,
}: PostBodyRichEditorProps) {
  const syncedRef = useRef<string | undefined>(undefined);
  const [value, setValue] = useState(() =>
    postBodyToTextareaValue(initialBody),
  );

  useEffect(() => {
    if (syncedRef.current === initialBody) {
      return;
    }
    syncedRef.current = initialBody;
    const next = postBodyToTextareaValue(initialBody);
    setValue(next);
    onHtmlChange(next);
  }, [initialBody, onHtmlChange]);

  return (
    <div className="post-body-editor">
      <textarea
        id="post-body-html"
        className="post-body-editor__textarea"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          onHtmlChange(next);
        }}
        spellCheck={false}
        rows={18}
        aria-label="HTML-текст поста"
        placeholder="<p>…</p>"
      />
    </div>
  );
}
