"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Code2, FileCode, Smartphone, Upload } from "lucide-react";

type OutputFormat = "svg" | "react" | "reactNative";

// Helper to convert kebab-case to camelCase
const toCamelCase = (str: string) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

// Helper to convert style string to object
const styleStringToObject = (styleString: string) => {
  const styles: Record<string, string> = {};
  styleString.split(";").forEach((style) => {
    const [key, value] = style.split(":");
    if (key && value) {
      styles[toCamelCase(key.trim())] = value.trim();
    }
  });
  return styles;
};

export default function SvgConverter() {
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("react");
  const [outputs, setOutputs] = useState({
    svg: "",
    react: "",
    reactNative: "",
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const convertToReact = (svgString: string, isNative: boolean = false) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) return "// Invalid SVG";

      const usedComponents = new Set<string>();

      const processNode = (node: Element): string => {
        const tagName = isNative
          ? node.tagName === "svg"
            ? "Svg"
            : node.tagName.charAt(0).toUpperCase() + node.tagName.slice(1)
          : node.tagName;

        if (isNative) {
          usedComponents.add(tagName);
        }

        let props = "";

        // Handle attributes
        Array.from(node.attributes).forEach((attr) => {
          let name = attr.name;
          let value = attr.value;

          // Skip xmlns for React Native or if redundant
          if (name === "xmlns" || name.startsWith("xmlns:")) return;

          // Convert attribute names
          if (name === "class") name = "className";
          else if (name.includes("-")) name = toCamelCase(name);

          // Handle style attribute
          if (name === "style") {
            const styleObj = styleStringToObject(value);
            value = `{${JSON.stringify(styleObj)}}`;
            props += ` ${name}=${value}`;
          } else {
            props += ` ${name}="${value}"`;
          }
        });

        const children = Array.from(node.children)
          .map((child) => processNode(child))
          .join("");

        return children
          ? `<${tagName}${props}>${children}</${tagName}>`
          : `<${tagName}${props} />`;
      };

      const jsxContent = processNode(svgElement);

      if (isNative) {
        const imports = Array.from(usedComponents).join(", ");
        return `import { ${imports} } from 'react-native-svg';\n\nexport const Icon = (props) => (\n  ${jsxContent.replace(/className=".*?"/g, "")}\n);`;
      }

      return `export const Icon = (props) => (\n  ${jsxContent}\n);`;
    } catch (e) {
      console.error(e);
      return "// Error converting SVG";
    }
  };

  const handleConvert = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);

    try {
      const prettier = (await import("prettier/standalone")).default;
      const parserHtml = (await import("prettier/plugins/html")).default;
      const parserBabel = (await import("prettier/plugins/babel")).default;
      const parserEstree = (await import("prettier/plugins/estree")).default;

      // 1. Format SVG
      let formattedSvg = code;
      try {
        formattedSvg = await prettier.format(code, {
          parser: "html",
          plugins: [parserHtml],
          printWidth: 80,
        });
      } catch (e) {
        console.warn("Prettier SVG format failed", e);
      }

      // 2. Convert to React
      const rawReact = convertToReact(code, false);
      let formattedReact = rawReact;
      try {
        formattedReact = await prettier.format(rawReact, {
          parser: "babel",
          plugins: [parserBabel, parserEstree],
          printWidth: 80,
        });
      } catch (e) {
        console.warn("Prettier React format failed", e);
      }

      // 3. Convert to React Native
      const rawNative = convertToReact(code, true);
      let formattedNative = rawNative;
      try {
        formattedNative = await prettier.format(rawNative, {
          parser: "babel",
          plugins: [parserBabel, parserEstree],
          printWidth: 80,
        });
      } catch (e) {
        console.warn("Prettier Native format failed", e);
      }

      setOutputs({
        svg: formattedSvg,
        react: formattedReact,
        reactNative: formattedNative,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      handleConvert(input);
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const handleCopy = () => {
    const textToCopy = outputs[outputFormat];
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    setLoading(true);
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const getIcon = (format: OutputFormat) => {
    switch (format) {
      case "svg":
        return <Code2 className="w-4 h-4" />;
      case "react":
        return <FileCode className="w-4 h-4" />;
      case "reactNative":
        return <Smartphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* Input Section */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Input SVG
            </h2>
            <span className="text-xs text-zinc-500">
              Paste code or upload file
            </span>
          </div>

          <label className="flex items-center justify-center gap-2 w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] font-medium shadow-sm group">
            <Upload className="w-5 h-5 group-hover:animate-bounce" />
            Upload SVG File
            <input
              type="file"
              accept=".svg"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          <div
            className={`relative flex-1 group transition-all ${isDragging ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              placeholder="<svg>...</svg>"
              spellCheck={false}
            />
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-blue-500 z-20">
                <div className="text-center">
                  <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-600 font-medium">
                    Drop SVG file here
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {input.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-4 h-full">
          {/* Preview */}
          <div className="h-40 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]"
              style={{ backgroundSize: "16px 16px" }}
            ></div>
            <div
              className="relative z-10 max-w-full max-h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-[100px] [&>svg]:max-h-[100px]"
              dangerouslySetInnerHTML={{ __html: input }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Output
              </h2>
              <div className="relative">
                <select
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(e.target.value as OutputFormat)
                  }
                  className="appearance-none pl-9 pr-8 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <option value="svg">SVG Code</option>
                  <option value="react">React Component</option>
                  <option value="reactNative">React Native</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  {getIcon(outputFormat)}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all active:scale-95"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : null}

            <div className="absolute inset-0 overflow-auto p-4">
              <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
                <code>
                  {outputs[outputFormat] || "// Waiting for input..."}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
