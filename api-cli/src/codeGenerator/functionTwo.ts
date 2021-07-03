import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { TypeScriptWriter, ClassDefinition } from "@yellicode/typescript";
import { AppsyncCode } from "../functions/Appsync";
const jsonObj = require("../../model.json");

for (var key in jsonObj.type.Query) {
  Generator.generateFromModel(
    { outputFile: `../../panacloud/lambda-fns/${key}.ts` },
    (output: TextWriter, model: any) => {
      const ts = new TypeScriptWriter(output);
      ts.writeLine(`
      const AWS = require('aws-sdk');

        async function ${key}() {
    
        return "hello world"
    }

    export default ${key};
    `);
    }
  );
}
