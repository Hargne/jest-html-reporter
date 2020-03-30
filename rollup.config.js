import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const extensions = [".ts", ".js"];

const config = {
  input: "src/index.ts",
  output: [
    {
      dir: "dist",
      format: "cjs"
    }
  ],
  external: ["xmlbuilder", "fs", "path", "dateformat", "mkdirp", "strip-ansi"],
  plugins: [
    resolve({
      jsnext: true,
      extensions
    }),
    babel({
      extensions
    }),
    terser()
  ]
};

export default config;
