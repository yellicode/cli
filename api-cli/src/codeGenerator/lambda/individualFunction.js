"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templating_1 = require("@yellicode/templating");
const dynamoDB_1 = require("../../functions/dynamoDB");
const jsonObj = require("../../../model.json");
Object.keys(jsonObj.type.Query).forEach((key) => {
  templating_1.Generator.generate(
    { outputFile: `../../../panacloud/lambda-fns/${key}.ts` },
    (writer) => {
      const db = new dynamoDB_1.DynamoDB(writer);
      db.listQuery(key);
    }
  );
});
Object.keys(jsonObj.type.Mutation).forEach((key) => {
  templating_1.Generator.generate(
    { outputFile: `../../../panacloud/lambda-fns/${key}.ts` },
    (writer) => {
      const db = new dynamoDB_1.DynamoDB(writer);
      if (key.includes("create") || key.includes("add")) {
        db.addQuery(key);
      }
      if (
        key.includes("delete") ||
        key.includes("remove") ||
        key.includes("cancel")
      ) {
        db.deleteQuery(key);
      }
      if (key.includes("update")) {
        db.updateQuery(key);
      }
    }
  );
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kaXZpZHVhbEZ1bmN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW5kaXZpZHVhbEZ1bmN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0RBQWtEO0FBQ2xELHVEQUFvRDtBQUNwRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUUvQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDOUMsc0JBQVMsQ0FBQyxRQUFRLENBQ2hCLEVBQUUsVUFBVSxFQUFFLGlDQUFpQyxHQUFHLEtBQUssRUFBRSxFQUN6RCxDQUFDLE1BQWtCLEVBQUUsRUFBRTtRQUNyQixNQUFNLEVBQUUsR0FBRyxJQUFJLG1CQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQ0YsQ0FBQztBQUNKLENBQUMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO0lBQ2pELHNCQUFTLENBQUMsUUFBUSxDQUNoQixFQUFFLFVBQVUsRUFBRSxpQ0FBaUMsR0FBRyxLQUFLLEVBQUUsRUFDekQsQ0FBQyxNQUFrQixFQUFFLEVBQUU7UUFDckIsTUFBTSxFQUFFLEdBQUcsSUFBSSxtQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pELEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbEI7UUFDRCxJQUNFLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQ3RCO1lBQ0EsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQjtRQUNELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMxQixFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQyxDQUNGLENBQUM7QUFDSixDQUFDLENBQUMsQ0FBQyJ9
