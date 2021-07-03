import { CodeWriter, TextWriter } from "@yellicode/core";
import { TypeScriptWriter } from "@yellicode/typescript";

export class Lambda extends CodeWriter {
  public initializeLambda(name: string) {
    this
      .writeLineIndented(` const lambdaFn = new lambda.Function(this, "${name}", {
        functionName: "${name}",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("lambda-fns"),
        memorySize: 1024,
      });`);
  }
  public importLambda(output: TextWriter) {
    const ts = new TypeScriptWriter(output);
    ts.writeImports("@aws-cdk/aws-lambda", "lambda");
  }
  public addEnvironment(name: string, value: string) {
    this.writeLine(`lambdaFn.addEnvironment("${name}", ${value});`);
  }
}
