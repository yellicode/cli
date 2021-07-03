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
    
    async function ${name}() {
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
    
    export default ${name}
    `);
    }
    addQuery(name) {
        this.writeLineIndented(`
    const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();

async function ${name}(todo: Todo) {
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

export default ${name};
    `);
    }
    deleteQuery(name) {
        this.writeLineIndented(`const AWS = require('aws-sdk');
    const docClient = new AWS.DynamoDB.DocumentClient();
    
    async function ${name}(TodoId: String) {
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
    
    export default ${name};`);
    }
}
exports.DynamoDB = DynamoDB;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwwQ0FBeUQ7QUFDekQsc0RBQXlEO0FBRXpELE1BQWEsUUFBUyxTQUFRLGlCQUFVO0lBQy9CLGtCQUFrQixDQUFDLElBQVk7UUFDcEMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHNDQUFzQyxJQUFJO3NCQUMvQyxJQUFJOzs7Ozs7VUFNaEIsQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUNNLGNBQWMsQ0FBQyxNQUFrQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxJQUFJLDZCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLEVBQUUsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUNNLGVBQWUsQ0FBQyxNQUFjO1FBQ25DLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLFNBQVMsQ0FBQyxJQUFZO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs7O3FCQUdOLElBQUk7Ozs7Ozs7Ozs7Ozs7cUJBYUosSUFBSTtLQUNwQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ00sUUFBUSxDQUFDLElBQVk7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDOzs7O2lCQUlWLElBQUk7Ozs7Ozs7Ozs7Ozs7O2lCQWNKLElBQUk7S0FDaEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNNLFdBQVcsQ0FBQyxJQUFZO1FBQzdCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs7O3FCQUdOLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBZ0JKLElBQUksR0FBRyxDQUN2QixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBcEZELDRCQW9GQyJ9