import type { Plugin } from "vite";
import * as path from "node:path";
import * as fs from "node:fs";

export type ClassnamePrefixOptions = {
  prefix?: string;
  include?: RegExp;
  exclude?: RegExp;
  codemod?: boolean;
};

export const transformer = (code: string, prefix: string) => {
  const attrRe = /(className|class)\s*=\s*("([^"]*)"|'([^']*)')/g;

  function transformLiteral(value: string): string {
    const parts = value
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => {
        return `${prefix}:${t}`;
        // const segments = t.split(":");
        // const base = segments.pop() as string;
        // const head = segments.join(":");
        // if (base.includes(prefix)) return t;
        // if (base.startsWith("!")) return `!${prefix}${base.slice(1)}`;
        // if (!head) return `${prefix}${base}`;
        // return `${head}:${prefix}${base}`;
      });
    return parts.join(" ");
  }

  // Best-effort transform for cn("...", { "...": cond }) pattern.
  // We do NOT fully parse JS. We operate only on quoted string literals and quoted object keys
  // inside the first-level parentheses of cn(...).
  function transformCnCalls(input: string): string {
    const nameRe = /\bcn\s*\(/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let out = "";

    while ((match = nameRe.exec(input))) {
      const start = match.index;
      out += input.slice(lastIndex, start);

      let i = nameRe.lastIndex; // after 'cn('
      let parenDepth = 1; // depth of parentheses relative to this cn(
      let braceDepth = 0; // depth of braces relative to the current token
      let inStr: '"' | "'" | null = null;
      let escaped = false;
      let buf = "";

      // Process cn(...) args, selectively transforming top-level strings and first-level object keys
      while (i < input.length) {
        const ch = input[i++];
        buf += ch;
        if (inStr) {
          if (!escaped && ch === inStr) {
            // String ended. Decide if we transform based on current depths.
            const strStart = buf.lastIndexOf(inStr, buf.length - 2);
            const content = buf.slice(strStart + 1, buf.length - 1);
            // Look ahead (from absolute position i) for a ':' if we're potentially an object key
            const nextNonWs = input.slice(i).match(/^\s*[:?,)]/);
            const isTopLevelArg = parenDepth === 1 && braceDepth === 0;
            const isTopLevelKey =
              parenDepth === 1 && braceDepth === 1 && nextNonWs && nextNonWs[0].trim().startsWith(":");
            if (isTopLevelArg || isTopLevelKey) {
              const transformed = transformLiteral(content);
              // Replace the just-captured string in buf with transformed content
              buf = buf.slice(0, strStart + 1) + transformed + buf.slice(buf.length - 1);
            }
            inStr = null;
            escaped = false;
            continue;
          }
          escaped = !escaped && ch === "\\" ? true : false;
          if (escaped && ch !== "\\") escaped = false;
          continue;
        }
        if (ch === '"' || ch === "'") {
          inStr = ch as '"' | "'";
          continue;
        }
        if (ch === "(") parenDepth++;
        else if (ch === ")") {
          parenDepth--;
          if (parenDepth === 0) {
            // Finished this cn(...). `buf` includes the closing ')', remove it before wrapping.
            const inner = buf.endsWith(")") ? buf.slice(0, -1) : buf;
            out += `cn(${inner})`;
            buf = "";
            break;
          }
        } else if (ch === "{") {
          braceDepth++;
        } else if (ch === "}") {
          braceDepth = Math.max(0, braceDepth - 1);
        }
      }

      lastIndex = i;
    }

    out += input.slice(lastIndex);
    return out;
  }

  // Best-effort transform for cva("...", { ... }) pattern.
  // We do NOT fully parse JS, just operate on string literals inside the first-level parentheses.
  function transformCvaCalls(input: string): string {
    const nameRe = /\bcva\s*\(/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let out = "";

    while ((match = nameRe.exec(input))) {
      const start = match.index;
      // Append code before cva(
      out += input.slice(lastIndex, start);

      // Find matching closing parenthesis for this cva( ... )
      let i = nameRe.lastIndex; // position after 'cva('
      let depth = 1;
      let inStr: '"' | "'" | "`" | null = null;
      let escaped = false;
      for (; i < input.length; i++) {
        const ch = input[i];
        if (inStr) {
          if (!escaped && ch === inStr) inStr = null;
          escaped = !escaped && ch === "\\" ? true : false;
          if (escaped && ch !== "\\") escaped = false;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          inStr = ch as '"' | "'" | "`";
          continue;
        }
        if (ch === "(") depth++;
        else if (ch === ")") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      const end = i;
      const args = input.slice(nameRe.lastIndex, end - 1); // content inside cva(...)

      // Transform ALL string literal arguments: "..." or '...' or `...`
      const transformed = args.replace(/(["'`])([^"'`]*)\1/g, (m, q, val) => {
        return `${q}${transformLiteral(val)}${q}`;
      });

      out += `cva(${transformed})`;
      lastIndex = end;
    }

    // Append the rest
    out += input.slice(lastIndex);
    return out;
  }

  // Skip files that don't contain className/class/cn/cva quickly
  if (!/\bclass(Name)?\s*=|\bcn\s*\(|\bcva\s*\(/.test(code)) return null;

  let out = code.replace(attrRe, (full, attr, quoted, dquotedVal, squotedVal) => {
    const val = dquotedVal ?? squotedVal ?? "";
    // Leave empty or already-prefixed-only values as-is (handled per-token anyway)
    const next = transformLiteral(val);
    const quote = quoted[0];
    return `${attr}=${quote}${next}${quote}`;
  });

  // Also process cn("...", { "...": cond }) patterns
  out = transformCnCalls(out);
  // Also process cva("...", { ... }) patterns
  out = transformCvaCalls(out);
  return out;
};

/**
 * Vite plugin to prefix class tokens in TSX/JSX string literals.
 *
 * Transforms occurrences like:
 *   <div className="btn primary sm:w-10"> -> <div className="korinai:btn korinai:primary korinai:sm:w-10">
 *   <div class='card shadow'> -> <div class='korinai:card korinai:shadow'>
 *
 * Notes:
 * - Only touches string literal attributes (className="..." | class='...').
 * - Leaves dynamic expressions (className={...}) unchanged.
 * - Skips tokens already starting with the prefix (e.g. "korinai:btn").
 */
export default function classnamePrefixPlugin(options: ClassnamePrefixOptions = {}): Plugin {
  const prefix = options.prefix ?? "korinai";
  const include = options.include ?? /\.(t|j)sx$/i;
  const exclude = options.exclude ?? /node_modules|dist/;

  return {
    name: "korinai-classname-prefix",
    enforce: "pre",
    apply: "build",
    closeBundle() {
      if (!options.codemod) {
        fs.rmSync("./tmp", { recursive: true });
      }
    },
    async transform(code, id) {
      if (!include.test(id) || exclude.test(id)) return null;

      const out = transformer(code, prefix);
      if (out === code || !out) return null;
      const dirs = id.split("/");
      const packageIdx = dirs.indexOf("packages");
      const parsedId = path.parse(dirs.slice(packageIdx).join("/"));
      parsedId.dir = parsedId.dir.replace("packages", "tmp");
      await this.fs.mkdir(parsedId.dir, { recursive: true });
      await this.fs.writeFile(parsedId.dir + "/" + parsedId.base, out);
      return { code: out, map: null };
    },
  };
}
