import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { TypeScriptWriter } from "@yellicode/typescript";
import { LambdaFunction } from "../../functions/lambda/lambdaFunction";

Generator.generateFromModel(
  { outputFile: "../../../panacloud/lambda-fns/main.ts" },
  (output: TextWriter, model: any) => {
    const ts = new TypeScriptWriter(output);
    const lambda = new LambdaFunction(output);

    for (var key in model.type.Query) {
      lambda.importIndividualFunction(output, key, `./${key}`);
    }

    for (var key in model.type.Mutation) {
      lambda.importIndividualFunction(output, key, `./${key}`);
    }
    ts.writeLine();
    ts.writeLineIndented(`
    type Event = {
        info: {
          fieldName: string
       }
     }`);
    ts.writeLine();
    lambda.initializeLambdaFunction(() => {
      for (var key in model.type.Query) {
        ts.writeLineIndented(`
          case "${key}":
              return await ${key}();
          `);
      }
      for (var key in model.type.Mutation) {
        ts.writeLineIndented(`
          case "${key}":
              return await ${key}();
          `);
      }
    }, output);
  }
);
