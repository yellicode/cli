import { TextWriter } from "@yellicode/core";
import { Generator } from "@yellicode/templating";
import { DynamoDB } from "../../functions/dynamoDB";
const jsonObj = require("../../../model.json");

Object.keys(jsonObj.type.Query).forEach((key) => {
  Generator.generate(
    { outputFile: `../../../panacloud/lambda-fns/${key}.ts` },
    (writer: TextWriter) => {
      const db = new DynamoDB(writer);
      db.listQuery(key);
    }
  );
});

Object.keys(jsonObj.type.Mutation).forEach((key) => {
  Generator.generate(
    { outputFile: `../../../panacloud/lambda-fns/${key}.ts` },
    (writer: TextWriter) => {
      const db = new DynamoDB(writer);

      if (key.includes("create") || key.includes("add")) {
        db.addQuery(key);
      }
      if (key.includes("delete") || key.includes("remove")) {
        db.deleteQuery(key);
      }
    }
  );
});
