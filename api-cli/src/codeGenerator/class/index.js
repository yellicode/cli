"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templating_1 = require("@yellicode/templating");
const typescript_1 = require("@yellicode/typescript");
const Appsync_1 = require("../../functions/Appsync");
const dynamoDB_1 = require("../../functions/dynamoDB");
const lambda_1 = require("../../functions/lambda");
const class_1 = require("../../functions//utils/class");
templating_1.Generator.generateFromModel(
  { outputFile: "../../../panacloud/lib/panacloud-stack.ts" },
  (output, model) => {
    const ts = new typescript_1.TypeScriptWriter(output);
    const lambda = new lambda_1.Lambda(output);
    const db = new dynamoDB_1.DynamoDB(output);
    const appsync = new Appsync_1.Appsync(output);
    const cls = new class_1.BasicClass(output);
    ts.writeImports("@aws-cdk/core", "cdk");
    appsync.importAppsync(output);
    lambda.importLambda(output);
    db.importDynamodb(output);
    cls.initializeClass(
      "PanacloudStack",
      () => {
        var _a, _b;
        appsync.initializeAppsync("api");
        ts.writeLine();
        lambda.initializeLambda("todoLambda");
        ts.writeLine();
        appsync.lambdaDataSource("lambdaDs", "lambdaFn");
        ts.writeLine();
        for (var key in (_a =
          model === null || model === void 0 ? void 0 : model.type) === null ||
        _a === void 0
          ? void 0
          : _a.Query) {
          appsync.lambdaDataSourceResolverQuery(key);
        }
        ts.writeLine();
        for (var key in (_b =
          model === null || model === void 0 ? void 0 : model.type) === null ||
        _b === void 0
          ? void 0
          : _b.Mutation) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNEQUFrRDtBQUNsRCxzREFBMEU7QUFDMUUscURBQWtEO0FBQ2xELHVEQUFvRDtBQUNwRCxtREFBZ0Q7QUFDaEQsd0RBQTBEO0FBRTFELHNCQUFTLENBQUMsaUJBQWlCLENBQ3pCLEVBQUUsVUFBVSxFQUFFLDJDQUEyQyxFQUFFLEVBQzNELENBQUMsTUFBa0IsRUFBRSxLQUFVLEVBQUUsRUFBRTtJQUNqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sRUFBRSxHQUFHLElBQUksbUJBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxrQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRW5DLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixFQUFFLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTFCLEdBQUcsQ0FBQyxlQUFlLENBQ2pCLGdCQUFnQixFQUNoQixHQUFHLEVBQUU7O1FBQ0gsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLEtBQUssSUFBSSxHQUFHLFVBQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksMENBQUUsS0FBSyxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM1QztRQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLEtBQUssSUFBSSxHQUFHLFVBQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLElBQUksMENBQUUsUUFBUSxFQUFFO1lBQ3JDLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMvQztRQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDZixFQUFFLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNmLE1BQU0sQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDeEQsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pCLENBQUMsRUFDRCxNQUFNLENBQ1AsQ0FBQztBQUNKLENBQUMsQ0FDRixDQUFDIn0=
