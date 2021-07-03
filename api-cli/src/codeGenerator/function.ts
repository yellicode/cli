import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { TypeScriptWriter, ClassDefinition } from "@yellicode/typescript";
import { AppsyncCode } from "./Appsync/methods";

Generator.generateFromModel(
  { outputFile: "../../panacloud/lib/new-stack.ts" },
  (output: TextWriter, model: any) => {
    const ts = new TypeScriptWriter(output);
    const aws = new AppsyncCode(output);
    const classDefinition: ClassDefinition = {
      name: "NewStack",
      extends: ["cdk.Stack"],
      export: true,
    };
    ts.writeImports("@aws-cdk/core", "cdk");
    ts.writeImports("@aws-cdk/aws-appsync", "appsync");
    ts.writeImports("@aws-cdk/aws-lambda", "lambda");
    ts.writeLine();
    ts.writeClassBlock(classDefinition, () => {
      ts.writeLineIndented(`  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
          super(scope, id, props);
          `);

      aws.initializeAppsync("gqlApi", "schema/something.gql");
      ts.writeLine();
      ts.writeLineIndented(`const todosLambda = new lambda.Function(this, "AppSynctodosHandler", {
              functionName: "todoFn",
              runtime: lambda.Runtime.NODEJS_12_X,
              handler: "main.handler",
              code: lambda.Code.fromAsset("lambda-fns"),
              memorySize: 1024,
            });`);
      ts.writeLine();
      ts.writeLineIndented(
        `const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);`
      );
      ts.writeLine();
      for (var key in model.type.Query) {
        ts.writeLine(` lambdaDs.createResolver({
                  typeName: "Query",
                  fieldName: "${key}",
                });`);
      }
      ts.writeLine("}");
    });
  }
);