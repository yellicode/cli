import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { TypeScriptWriter, ClassDefinition } from "@yellicode/typescript";
import { AppsyncCode } from "./Appsync/methods";

Generator.generateFromModel(
  { outputFile: "../../panacloud/lambda-fns/main.ts" },
  (output: TextWriter, model: any) => {
    const ts = new TypeScriptWriter(output);
    const aws = new AppsyncCode(output);

    

    for (var key in model.type.Query) {
      ts.writeImports(`./${key}`, [`${key}`]);
    }
    ts.writeLine();
    ts.writeLine(`type AppSyncEvent = {
      info: {
        fieldName: string
     }
    }`);
    ts.writeLine(`exports.handler = async (event:AppSyncEvent) => {`);
    ts.writeLine(`switch (event.info.fieldName) {`);
    for (var key in model.type.Query) {
      ts.writeLine(` case "${key}":
      return await ${key}();`);
    }
    ts.writeLine(`}`);
    ts.writeLine(`}`);
  }
);
