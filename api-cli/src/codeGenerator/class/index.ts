import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { TypeScriptWriter, ClassDefinition } from "@yellicode/typescript";
import { Appsync } from "../../functions/Appsync";
import { DynamoDB } from "../../functions/dynamoDB";
import { Lambda } from "../../functions/lambda";
import { BasicClass } from "../../functions//utils/class";

Generator.generateFromModel(
  { outputFile: "../../../panacloud/lib/panacloud-stack.ts" },
  (output: TextWriter, model: any) => {
    const ts = new TypeScriptWriter(output);
    const lambda = new Lambda(output);
    const db = new DynamoDB(output);
    const appsync = new Appsync(output);
    const cls = new BasicClass(output);

    ts.writeImports("@aws-cdk/core", "cdk");
    appsync.importAppsync(output);
    lambda.importLambda(output);
    db.importDynamodb(output);

    cls.initializeClass(
      "PanacloudStack",
      () => {
        appsync.initializeAppsync("api");
        ts.writeLine();
        lambda.initializeLambda("todoLambda");
        ts.writeLine();
        appsync.lambdaDataSource("lambdaDs", "lambdaFn");
        ts.writeLine();
        for (var key in model?.type?.Query) {
          appsync.lambdaDataSourceResolverQuery(key);
        }
        ts.writeLine();
        for (var key in model?.type?.Mutation) {
          appsync.lambdaDataSourceResolverMutation(key);
        }
        ts.writeLine();
        db.initializeDynamodb("todoTable");
        ts.writeLine();
        db.grantFullAccess("lambdaFn");
        ts.writeLine();
        lambda.addEnvironment("TODOS_TABLE", "table.tableName");
        ts.writeLine();
      },
      output
    );
  }
);
