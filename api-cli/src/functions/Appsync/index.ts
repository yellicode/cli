import { CodeWriter, TextWriter } from "@yellicode/core";
import { TypeScriptWriter } from "@yellicode/typescript";

export class Appsync extends CodeWriter {
  public initializeAppsync(name: string) {
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
  public importAppsync(output: TextWriter) {
    const ts = new TypeScriptWriter(output);
    ts.writeImports("@aws-cdk/aws-appsync", "appsync");
  }
  public lambdaDataSource(name: string, lambda: string) {
    this.writeLine(
      `const lambdaDs = api.addLambdaDataSource("${name}", ${lambda})`
    );
  }
  public lambdaDataSourceResolverQuery(value: string) {
    this.writeLineIndented(` lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "${value}",
    });`);
  }
  public lambdaDataSourceResolverMutation(value: string) {
    this.writeLineIndented(` lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "${value}",
    });`);
  }
}
