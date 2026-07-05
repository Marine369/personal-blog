"use client";

import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={500}
        preview="live"
        visibleDragbar={false}
      />
    </div>
  );
}
