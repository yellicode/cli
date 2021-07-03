import { Command, flags } from "@oclif/command";
import { start } from "../../utils/index";
const fs = require("fs");
const exec = require("await-exec");
const convert = require("graphql-to-json-converter");

export default class Hello extends Command {
  static flags = {
    graphqlSchema: flags.string({
      char: "g",
      description: "graphql schema path",
      required: true,
    }),
  };

  async run() {
    const { flags } = this.parse(Hello);

    this.log("CDK init");
    await exec(
      `mkdir panacloud && cd panacloud && cdk init --language=typescript`
    );
    this.log("CDK init DONE");
    this.log("Installing packages");
    await exec(
      `cd panacloud && npm i @aws-cdk/aws-appsync @aws-cdk/aws-dynamodb @aws-cdk/aws-lambda`
    );
    this.log("GQL copy from path to destination");
    await exec(`cd panacloud && mkdir graphql`);
    fs.copyFile(
      flags.graphqlSchema,
      "panacloud/graphql/schema.graphql",
      (err: any) => {
        if (err) throw err;
      }
    );
    this.log("Copy pasting DONE");

    this.log("Converting GQL to JSON");
    const schema = fs.readFileSync(flags.graphqlSchema, "utf8");
    const jsonSchema = convert(schema);
    fs.writeFile("model.json", JSON.stringify(jsonSchema), function (err: any) {
      if (err) throw err;
    });
    fs.unlink("panacloud/lib/panacloud-stack.ts", function (err: any) {
      if (err) throw err;
    });
    this.log("Converting DONE");

    this.log("Yellicode run");
    await start();
    this.log("Fromatting");
  }
}
