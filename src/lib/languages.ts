export interface LanguageGroup {
  label: string;
  languages: string[];
}

export const LANGUAGE_GROUPS: LanguageGroup[] = [
  {
    label: 'Popular',
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'],
  },
  {
    label: 'Web',
    languages: ['HTML', 'CSS', 'Sass', 'Less', 'CoffeeScript', 'Elm', 'Svelte', 'WebAssembly'],
  },
  {
    label: 'Scripting',
    languages: ['Bash', 'Shell', 'PowerShell', 'Lua', 'Perl', 'AWK', 'Tcl', 'Fish'],
  },
  {
    label: 'JVM',
    languages: ['Scala', 'Clojure', 'Groovy', 'Ceylon'],
  },
  {
    label: 'Functional',
    languages: ['Haskell', 'Erlang', 'Elixir', 'OCaml', 'F#', 'PureScript', 'Idris', 'Agda', 'Standard ML', 'Racket'],
  },
  {
    label: 'Systems / Low-Level',
    languages: ['Assembly', 'Zig', 'Nim', 'D', 'Ada', 'Fortran', 'Pascal', 'VHDL', 'Verilog'],
  },
  {
    label: 'Mobile',
    languages: ['Dart', 'Objective-C', 'Objective-C++'],
  },
  {
    label: '.NET',
    languages: ['VB.NET', 'C++/CLI', 'F#'],
  },
  {
    label: 'Data / Science',
    languages: ['R', 'Julia', 'MATLAB', 'SAS', 'Stata', 'SPSS', 'Wolfram Language'],
  },
  {
    label: 'Database',
    languages: ['SQL', 'PL/SQL', 'T-SQL', 'PLSQL', 'GraphQL'],
  },
  {
    label: 'Blockchain',
    languages: ['Solidity', 'Vyper', 'Move', 'Cairo', 'Michelson', 'Clarity'],
  },
  {
    label: 'GPU / Graphics',
    languages: ['CUDA', 'OpenCL', 'GLSL', 'HLSL', 'Metal', 'WGSL'],
  },
  {
    label: 'Infrastructure / Config',
    languages: ['HCL', 'Puppet', 'Nix', 'Dockerfile', 'Makefile'],
  },
  {
    label: 'New & Trending',
    languages: ['Mojo', 'Carbon', 'Val', 'Odin', 'Crystal', 'V', 'Roc', 'Gleam', 'Bend'],
  },
  {
    label: 'Academic / Esoteric',
    languages: ['Prolog', 'Lisp', 'Scheme', 'Smalltalk', 'APL', 'J', 'K', 'Q', 'COBOL', 'RPG', 'ALGOL'],
  },
  {
    label: 'Game Dev',
    languages: ['GDScript', 'Lua', 'UnrealScript', 'AngelScript'],
  },
];

export const ALL_LANGUAGES = LANGUAGE_GROUPS.flatMap((g) => g.languages);
