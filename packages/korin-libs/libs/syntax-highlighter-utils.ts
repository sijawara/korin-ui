/**
 * Maps file extensions to Prism-supported language keys.
 * Returns the language string for use with Prism/React Syntax Highlighter,
 * or undefined if no match is found.
 *
 * If multiple extensions match, the longest (most specific) one is used.
 */
const extensionToLanguageMap: Record<string, string> = {
  abap: 'abap',
  abnf: 'abnf',
  as: 'actionscript',
  ada: 'ada',
  agda: 'agda',
  al: 'al',
  antlr4: 'antlr4',
  apacheconf: 'apacheconf',
  applescript: 'applescript',
  arduino: 'arduino',
  arff: 'arff',
  asciidoc: 'asciidoc',
  asm: 'asm6502',
  asmatmel: 'asmatmel',
  asp: 'aspnet',
  autohotkey: 'autohotkey',
  autoit: 'autoit',
  avisynth: 'avisynth',
  avro: 'avroIdl',
  // Shell scripts can be .sh or .bash
  sh: 'bash',
  bash: 'bash',
  basic: 'basic',
  bat: 'batch',
  bbcode: 'bbcode',
  bicep: 'bicep',
  birb: 'birb',
  bison: 'bison',
  bnf: 'bnf',
  brainfuck: 'brainfuck',
  brightscript: 'brightscript',
  bro: 'bro',
  c: 'c',
  h: 'c',
  cfc: 'cfscript',
  clj: 'clojure',
  cljs: 'clojure',
  cmake: 'cmake',
  cobol: 'cobol',
  coffee: 'coffeescript',
  cpp: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  cshtml: 'cshtml',
  css: 'css',
  csv: 'csv',
  d: 'd',
  dart: 'dart',
  diff: 'diff',
  django: 'django',
  dockerfile: 'docker',
  ejs: 'ejs',
  elm: 'elm',
  erl: 'erlang',
  f: 'fortran',
  f90: 'fortran',
  fs: 'fsharp',
  gd: 'gdscript',
  gherkin: 'gherkin',
  git: 'git',
  glsl: 'glsl',
  go: 'go',
  graphql: 'graphql',
  groovy: 'groovy',
  haml: 'haml',
  hbs: 'handlebars',
  hs: 'haskell',
  hcl: 'hcl',
  hlsl: 'hlsl',
  http: 'http',
  ini: 'ini',
  java: 'java',
  jl: 'julia',
  js: 'javascript',
  json: 'json',
  jsx: 'jsx',
  kt: 'kotlin',
  kts: 'kotlin',
  latex: 'latex',
  less: 'less',
  lisp: 'lisp',
  lua: 'lua',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'markdown',
  matlab: 'matlab',
  // 'm' could be either matlab or objective-c, default to objective-c as it's more common
  m: 'objectivec',
  mm: 'objectivec',
  mermaid: 'mermaid',
  mmd: 'mermaid',
  nginx: 'nginx',
  nix: 'nix',
  ml: 'ocaml',
  pas: 'pascal',
  pl: 'perl',
  php: 'php',
  ps1: 'powershell',
  psd1: 'powershell',
  psm1: 'powershell',
  prisma: 'prisma',
  proto: 'protobuf',
  py: 'python',
  r: 'r',
  rb: 'ruby',
  rs: 'rust',
  sass: 'sass',
  scala: 'scala',
  scss: 'scss',
  // 'sh' is already mapped to 'bash' above
  sql: 'sql',
  swift: 'swift',
  toml: 'toml',
  ts: 'typescript',
  tsx: 'tsx',
  twig: 'twig',
  v: 'verilog',
  vhdl: 'vhdl',
  vim: 'vim',
  vue: 'vue',
  wasm: 'wasm',
  xml: 'xml',
  yaml: 'yaml',
  yml: 'yaml',
  zig: 'zig',
};

/**
 * Gets the appropriate language key for syntax highlighting based on a filename or file path.
 * @param filename The filename or path to analyze
 * @returns The language key if found, or undefined if no match
 */
export function getLanguageFromFilename(filename: string): string | undefined {
  if (!filename) return undefined;
  
  // Extract the last part after any path separators
  const lastSlash = Math.max(
    filename.lastIndexOf('/'),
    filename.lastIndexOf('\\')
  );
  const basename = lastSlash >= 0 ? filename.slice(lastSlash + 1) : filename;
  
  // Split into parts and try to find the longest matching extension
  const parts = basename.split('.');
  if (parts.length <= 1) return undefined; // No extension
  
  // Try combinations from most specific to least specific
  for (let i = 1; i < parts.length; i++) {
    const ext = parts.slice(i).join('.').toLowerCase();
    if (extensionToLanguageMap[ext]) {
      return extensionToLanguageMap[ext];
    }
  }
  
  // Try with just the last part as extension
  const lastExt = parts[parts.length - 1].toLowerCase();
  return extensionToLanguageMap[lastExt];
}

// Export as default for backward compatibility
export default getLanguageFromFilename;