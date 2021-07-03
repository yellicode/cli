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
            extends: ["cdk.stack"],
            export: true,
        };
        ts.writeClassBlock(classDefinition, contents);
    }
}
exports.BasicClass = BasicClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQTBFO0FBRTFFLE1BQWEsVUFBVyxTQUFRLGlCQUFVO0lBQ2pDLGVBQWUsQ0FDcEIsSUFBWSxFQUNaLFFBQTRDLEVBQzVDLE1BQWtCO1FBRWxCLE1BQU0sRUFBRSxHQUFHLElBQUksNkJBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsTUFBTSxlQUFlLEdBQW9CO1lBQ3ZDLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxJQUFJO1NBQ2IsQ0FBQztRQUNGLEVBQUUsQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7Q0FDRjtBQWRELGdDQWNDIn0=