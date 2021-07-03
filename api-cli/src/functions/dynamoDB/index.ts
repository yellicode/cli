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
  public addQuery(name: string) {
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
  public deleteQuery(name: string) {
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
  public updateQuery(name: string) {
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
