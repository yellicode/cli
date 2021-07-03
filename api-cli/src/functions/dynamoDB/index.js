"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDB = void 0;
const core_1 = require("@yellicode/core");
const typescript_1 = require("@yellicode/typescript");
class DynamoDB extends core_1.CodeWriter {
    initializeDynamodb(name) {
        this.writeLineIndented(`const table = new ddb.Table(this, "${name}", {
        tableName: "${name}",
        billingMode: ddb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: ddb.AttributeType.STRING,
        },
      });`);
    }
    importDynamodb(output) {
        const ts = new typescript_1.TypeScriptWriter(output);
        ts.writeImports("@aws-cdk/aws-dynamodb", "ddb");
    }
    grantFullAccess(lambda) {
        this.writeLine(`table.grantFullAccess(${lambda});`);
    }
}
exports.DynamoDB = DynamoDB;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsUUFBUyxTQUFRLGlCQUFVO0lBQy9CLGtCQUFrQixDQUFDLElBQVk7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNDQUFzQyxJQUFJO3NCQUMvQyxJQUFJOzs7Ozs7VUFNaEIsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUNNLGNBQWMsQ0FBQyxNQUFrQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNNLGVBQWUsQ0FBQyxNQUFjO1FBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztDQUNGO0FBbEJELDRCQWtCQyJ9