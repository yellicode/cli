"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templating_1 = require("@yellicode/templating");
const typescript_1 = require("@yellicode/typescript");
templating_1.Generator.generate({ outputFile: "./cdk-output.ts" }, (output) => {
    const ts = new typescript_1.TypeScriptWriter(output);
    ts.writeImports("@aws-cdk/core", "cdk");
    ts.writeImports("@aws-cdk/aws-appsync", "appsync");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tzdGFydC50ZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInF1aWNrc3RhcnQudGVtcGxhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxzREFBa0Q7QUFDbEQsc0RBQTBEO0FBRTFELHNCQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsVUFBVSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxNQUFrQixFQUFFLEVBQUU7SUFDM0UsTUFBTSxFQUFFLEdBQUcsSUFBSSw2QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxFQUFFLENBQUMsWUFBWSxDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFBO0FBQ3BELENBQUMsQ0FBQyxDQUFBIn0=