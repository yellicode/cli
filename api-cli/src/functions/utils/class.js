"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicClass = void 0;
const core_1 = require("@yellicode/core");
const typescript_1 = require("@yellicode/typescript");
class BasicClass extends core_1.CodeWriter {
  initializeClass(name, contents, output) {
    const ts = new typescript_1.TypeScriptWriter(output);
    const classDefinition = {
      name: name,
      extends: ["cdk.Stack"],
      export: true,
    };
    ts.writeClassBlock(classDefinition, () => {
      ts.writeLineIndented(` 
      constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
          super(scope, id, props);
      `);
      contents();
      ts.writeLineIndented(`}`);
    });
  }
}
exports.BasicClass = BasicClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQTBFO0FBRTFFLE1BQWEsVUFBVyxTQUFRLGlCQUFVO0lBQ2pDLGVBQWUsQ0FBQyxJQUFZLEVBQUUsUUFBYSxFQUFFLE1BQWtCO1FBQ3BFLE1BQU0sRUFBRSxHQUFHLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxlQUFlLEdBQW9CO1lBQ3ZDLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxJQUFJO1NBQ2IsQ0FBQztRQUNGLEVBQUUsQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtZQUN2QyxFQUFFLENBQUMsaUJBQWlCLENBQUM7OztPQUdwQixDQUFDLENBQUM7WUFDSCxRQUFRLEVBQUUsQ0FBQztZQUNYLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWpCRCxnQ0FpQkMifQ==
