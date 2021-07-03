"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templating_1 = require("@yellicode/templating");
const typescript_1 = require("@yellicode/typescript");
const lambdaFunction_1 = require("../../functions/lambda/lambdaFunction");
templating_1.Generator.generateFromModel({ outputFile: "../../../panacloud/lambda-fns/main.ts" }, (output, model) => {
    const ts = new typescript_1.TypeScriptWriter(output);
    const lambda = new lambdaFunction_1.LambdaFunction(output);
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdGlhbGl6ZUxhbWJkYUZ1bmN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW5pdGlhbGl6ZUxhbWJkYUZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0RBQWtEO0FBQ2xELHNEQUF5RDtBQUN6RCwwRUFBdUU7QUFFdkUsc0JBQVMsQ0FBQyxpQkFBaUIsQ0FDekIsRUFBRSxVQUFVLEVBQUUsdUNBQXVDLEVBQUUsRUFDdkQsQ0FBQyxNQUFrQixFQUFFLEtBQVUsRUFBRSxFQUFFO0lBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSwrQkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTFDLEtBQUssSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDaEMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNuQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDZixFQUFFLENBQUMsaUJBQWlCLENBQUM7Ozs7O09BS2xCLENBQUMsQ0FBQztJQUNMLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNmLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUU7UUFDbkMsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNoQyxFQUFFLENBQUMsaUJBQWlCLENBQUM7a0JBQ1gsR0FBRzs2QkFDUSxHQUFHO1dBQ3JCLENBQUMsQ0FBQztTQUNOO1FBQ0QsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNuQyxFQUFFLENBQUMsaUJBQWlCLENBQUM7a0JBQ1gsR0FBRzs2QkFDUSxHQUFHO1dBQ3JCLENBQUMsQ0FBQztTQUNOO0lBQ0gsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUNGLENBQUMifQ==