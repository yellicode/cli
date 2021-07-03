"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appsync = void 0;
const core_1 = require("@yellicode/core");
const typescript_1 = require("@yellicode/typescript");
class Appsync extends core_1.CodeWriter {
    initializeAppsync(name) {
        this
            .writeLineIndented(` const api = new appsync.GraphqlApi(this, "${name}", {
            name: "${name}",
            schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
            authorizationConfig: {
              defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.API_KEY,
              },
            },
            xrayEnabled: true,
          });`);
    }
    importAppsync(output) {
        const ts = new typescript_1.TypeScriptWriter(output);
        ts.writeImports("@aws-cdk/aws-appsync", "appsync");
    }
    lambdaDataSource(name, lambda) {
        this.writeLine(`const lambdaDs = api.addLambdaDataSource("${name}", ${lambda})`);
    }
    lambdaDataSourceResolverQuery(value) {
        this.writeLineIndented(` lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "${value}",
    });`);
    }
    lambdaDataSourceResolverMutation(value) {
        this.writeLineIndented(` lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "${value}",
    });`);
    }
}
exports.Appsync = Appsync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsT0FBUSxTQUFRLGlCQUFVO0lBQzlCLGlCQUFpQixDQUFDLElBQVk7UUFDbkMsSUFBSTthQUNELGlCQUFpQixDQUFDLDhDQUE4QyxJQUFJO3FCQUN0RCxJQUFJOzs7Ozs7OztjQVFYLENBQUMsQ0FBQztJQUNkLENBQUM7SUFDTSxhQUFhLENBQUMsTUFBa0I7UUFDckMsTUFBTSxFQUFFLEdBQUcsSUFBSSw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDTSxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsTUFBYztRQUNsRCxJQUFJLENBQUMsU0FBUyxDQUNaLDZDQUE2QyxJQUFJLE1BQU0sTUFBTSxHQUFHLENBQ2pFLENBQUM7SUFDSixDQUFDO0lBQ00sNkJBQTZCLENBQUMsS0FBYTtRQUNoRCxJQUFJLENBQUMsaUJBQWlCLENBQUM7O29CQUVQLEtBQUs7UUFDakIsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUNNLGdDQUFnQyxDQUFDLEtBQWE7UUFDbkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDOztvQkFFUCxLQUFLO1FBQ2pCLENBQUMsQ0FBQztJQUNSLENBQUM7Q0FDRjtBQW5DRCwwQkFtQ0MifQ==