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
  listQuery(name) {
    this.writeLineIndented(`const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    
    export async function ${name}() {
        const params = {
            TableName: process.env.TODOS_TABLE,
        }
        try {
            const data = await docClient.scan(params).promise()
            return data.Items
        } catch (err) {
            console.log('DynamoDB error: ', err)
            return null
        }
    }
    
    `);
  }
  addQuery(name) {
    this.writeLineIndented(`
    const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();

    export async function ${name}(todo: Todo) {
    const params = {
        TableName: process.env.TODOS_TABLE,
        Item: todo
    }
    try {
        await docClient.put(params).promise();
        return todo;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}
   `);
  }
  deleteQuery(name) {
    this.writeLineIndented(`const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    
    export async function ${name}(TodoId: String) {
        const params = {
            TableName: process.env.TODOS_TABLE,
            Key: {
              id: TodoId
            }
        }
        try {
            await docClient.delete(params).promise()
            return TodoId
        } catch (err) {
            console.log('DynamoDB error: ', err)
            return null
        }
    }
    `);
  }
  updateQuery(name) {
    this.writeLineIndented(`const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    
    type Params = {
        TableName: string | undefined,
        Key: string | {},
        ExpressionAttributeValues: any,
        ExpressionAttributeNames: any,
        UpdateExpression: string,
        ReturnValues: string
    }
    
    export async function ${name}(todo: any) {
        let params: Params = {
            TableName: process.env.TODOS_TABLE,
            Key: {
                id: todo.id
            },
            ExpressionAttributeValues: {},
            ExpressionAttributeNames: {},
            UpdateExpression: "",
            ReturnValues: "UPDATED_NEW"
        };
        let prefix = "set ";
        let attributes = Object.keys(todo);
        for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];
            if (attribute !== "id") {
                params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
                params["ExpressionAttributeValues"][":" + attribute] = todo[attribute];
                params["ExpressionAttributeNames"]["#" + attribute] = attribute;
                prefix = ", ";
            }
        }
    
        try {
            await docClient.update(params).promise()
            return todo
        } catch (err) {
            console.log('DynamoDB error: ', err)
            return null
        }
    }
    
    `);
  }
}
exports.DynamoDB = DynamoDB;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsUUFBUyxTQUFRLGlCQUFVO0lBQy9CLGtCQUFrQixDQUFDLElBQVk7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNDQUFzQyxJQUFJO3NCQUMvQyxJQUFJOzs7Ozs7VUFNaEIsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUNNLGNBQWMsQ0FBQyxNQUFrQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNNLGVBQWUsQ0FBQyxNQUFjO1FBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLFNBQVMsQ0FBQyxJQUFZO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs7OzRCQUdDLElBQUk7Ozs7Ozs7Ozs7Ozs7S0FhM0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNNLFFBQVEsQ0FBQyxJQUFZO1FBQzFCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs7Ozs0QkFJQyxJQUFJOzs7Ozs7Ozs7Ozs7O0lBYTVCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFDTSxXQUFXLENBQUMsSUFBWTtRQUM3QixJQUFJLENBQUMsaUJBQWlCLENBQUM7Ozs0QkFHQyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7S0FlM0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNNLFdBQVcsQ0FBQyxJQUFZO1FBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs7Ozs7Ozs7Ozs7OzRCQVlDLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBZ0MzQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE5SEQsNEJBOEhDIn0=
