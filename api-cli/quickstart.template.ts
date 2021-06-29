import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import {  TypeScriptWriter,} from "@yellicode/typescript";

Generator.generate({ outputFile: "./cdk-output.ts" }, (output: TextWriter) => {
  const ts = new TypeScriptWriter(output);
  ts.writeImports("@aws-cdk/core", "cdk");
  ts.writeImports("@aws-cdk/aws-appsync", "appsync")
})