import type { ReactNode } from "react";

// Lightweight Markdown renderer.
// Handles: ## / ### headers, **bold**, `inline code`, ```code blocks```,
// - / * bullet lists, and | tables |.
export function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const block: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        block.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-[#eef0e5] border border-line rounded-md px-4 py-3.5
                                text-[12px] font-mono overflow-x-auto my-3.5 leading-relaxed text-ink-1">
          <code>{block.join("\n")}</code>
        </pre>
      );
      i++; // skip closing ```
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-[15px] font-semibold text-ink-1 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[14px] font-semibold text-ink-1 mt-4 mb-1.5">
          {line.slice(4)}
        </h3>
      );
      i++; continue;
    }

    // Table row
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|[\s\-:]+\|/)) { // skip separator row
          rows.push(lines[i].split("|").filter((_, idx) => idx > 0 && idx < lines[i].split("|").length - 1).map(c => c.trim()));
        }
        i++;
      }
      if (rows.length > 0) {
        elements.push(
          <div key={i} className="overflow-x-auto my-3.5">
            <table className="w-full text-[12.5px] border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {rows[0].map((cell, ci) => (
                    <th key={ci} className="text-left px-3 py-2 font-semibold text-ink-1 bg-[#f7f8f0]">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-b border-line last:border-b-0 hover:bg-[#f7f8f0]">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-ink-2"><InlineMarkdown text={cell} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 text-[13.5px] text-ink-2 my-0.5">
          <span className="text-ink-3 flex-shrink-0 mt-0.5">•</span>
          <span><InlineMarkdown text={line.slice(2)} /></span>
        </div>
      );
      i++; continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(
      <p key={i} className="text-[13.5px] text-ink-2 leading-[1.75]">
        <InlineMarkdown text={line} />
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-ink-1">{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="font-mono text-[12px] bg-[#eef0e5] px-1 py-0.5 rounded text-ink-1">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default MarkdownRenderer;
