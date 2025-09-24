"use client";
import { useEffect, useState } from "react";

export default function StatusToast({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [text]);
  if (!visible) return null;
  return (
    <div className="fixed right-4 top-16 z-50">
      <div className="rounded-lg border bg-white shadow px-3 py-2 text-sm">
        {text}
      </div>
    </div>
  );
}
