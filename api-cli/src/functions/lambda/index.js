"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lambda = void 0;
const core_1 = require("@yellicode/core");
const typescript_1 = require("@yellicode/typescript");
class Lambda extends core_1.CodeWriter {
    initializeLambda(name) {
        this
            .writeLineIndented(` const lambda = new lambda.Function(this, "${name}", {
        functionName: "${name}",
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: "main.handler",
        code: lambda.Code.fromAsset("lambda-fns"),
        memorySize: 1024,
      });`);
    }
    importLambda(output) {
        const ts = new typescript_1.TypeScriptWriter(output);
        ts.writeImports("@aws-cdk/aws-lambda", "lambda");
    }
    addEnvironment(name, value) {
        this.writeLine(`lambda.addEnvironment("${name}", ${value});`);
    }
}
exports.Lambda = Lambda;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsTUFBTyxTQUFRLGlCQUFVO0lBQzdCLGdCQUFnQixDQUFDLElBQVk7UUFDbEMsSUFBSTthQUNELGlCQUFpQixDQUFDLDhDQUE4QyxJQUFJO3lCQUNsRCxJQUFJOzs7OztVQUtuQixDQUFDLENBQUM7SUFDVixDQUFDO0lBQ00sWUFBWSxDQUFDLE1BQWtCO1FBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBQ00sY0FBYyxDQUFDLElBQVksRUFBRSxLQUFhO1FBQy9DLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7Q0FDRjtBQWxCRCx3QkFrQkMifQ==