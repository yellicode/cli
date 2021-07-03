import { CodeWriter, TextWriter } from "@yellicode/core";
import { TypeScriptWriter } from "@yellicode/typescript";

export class DynamoDB extends CodeWriter {
  public initializeDynamodb(name: string) {
    this.writeLineIndented(`const table = new ddb.Table(this, "${name}", {
        tableName: "${name}",
        billingMode: ddb.BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: "id",
          type: ddb.AttributeType.STRING,
        },
      });`);
  }
  public importDynamodb(output: TextWriter) {
    const ts = new TypeScriptWriter(output);
    ts.writeImports("@aws-cdk/aws-dynamodb", "ddb");
  }
  public grantFullAccess(lambda: string) {
    this.writeLine(`table.grantFullAccess(${lambda});`);
  }

  public listQuery(name: string) {
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
  public addQuery(name: string) {
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
  public deleteQuery(name: string) {
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
    
    export default ${name};`
    );
  }
}
