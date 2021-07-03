"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LambdaFunction = void 0;
const core_1 = require("@yellicode/core");
const typescript_1 = require("@yellicode/typescript");
class LambdaFunction extends core_1.CodeWriter {
  initializeLambdaFunction(content, output) {
    const ts = new typescript_1.TypeScriptWriter(output);
    ts.writeLine(`exports.handler = async (event:Event) => {`);
    ts.writeLine(`switch (event.info.fieldName) {`);
    ts.writeLine();
    content();
    ts.writeLine();
    ts.writeLine(`}`);
    ts.writeLine(`}`);
  }
  importIndividualFunction(output, name, path) {
    const ts = new typescript_1.TypeScriptWriter(output);
    ts.writeImports(path, [name]);
  }
}
exports.LambdaFunction = LambdaFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhRnVuY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsYW1iZGFGdW5jdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsY0FBZSxTQUFRLGlCQUFVO0lBQ3JDLHdCQUF3QixDQUFDLE9BQVksRUFBRSxNQUFrQjtRQUM5RCxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxTQUFTLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUMzRCxFQUFFLENBQUMsU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDaEQsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2YsT0FBTyxFQUFFLENBQUM7UUFDVixFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDZixFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUNNLHdCQUF3QixDQUM3QixNQUFrQixFQUNsQixJQUFZLEVBQ1osSUFBWTtRQUVaLE1BQU0sRUFBRSxHQUFHLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7Q0FDRjtBQW5CRCx3Q0FtQkMifQ==
