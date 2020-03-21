import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

const extensions = [".ts", ".js"];

const config = {
  input: "src/index.ts",
  output: [
    {
      dir: "dist",
      format: "cjs"
    }
  ],
  plugins: [
    resolve({
      jsnext: true,
      extensions
    }),
    babel({
      extensions
    })
  ],
  external: ["xmlbuilder", "fs", "path", "dateformat", "mkdirp", "strip-ansi"]
};

export default config;
