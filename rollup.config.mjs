import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const extensions = [".ts", ".js"];

const config = {
  input: "src/index.ts",
  output: {
    dir: "dist",
    format: "cjs",
    exports: "default",
    sourcemap: false,
  },
  external: ["xmlbuilder", "fs", "path", "dateformat", "mkdirp", "strip-ansi"],
  plugins: [
    resolve({
      jsnext: true,
      extensions,
    }),
    typescript({
      tsconfig: "tsconfig.json",
      sourceMap: false,
    }),
    terser(),
  ],
};

export default config;
