import { Command, flags } from "@oclif/command";
import { start } from "../../utils/index";
var rimraf = require("rimraf");
const fs = require("fs");
var Git = require("nodegit");
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

    this.log("GQL copy from path to destination");
    await exec(`cd panacloud && mkdir graphql`)
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
    this.log("Converting DONE")

    this.log("Yellicode run")
    start()
    this.log("DONE")

    // this.log("Git Repo");
    // await Git.Clone(
    //   "https://github.com/panacloud/cloud-api-template",
    //   "panacloud"
    // ).then(function (repository: any) {
    //   return repository.getBranchCommit("main");
    // });
    //   this.log("GQL copy");
    // fs.copyFile(
    //   flags.graphqlSchema,
    //   "panacloud/graphql/schema.graphql",
    //   (err: any) => {
    //     if (err) throw err;
    //   }
    // );
    // this.log("Converting");
    // const schema = fs.readFileSync(flags.graphqlSchema, "utf8");
    // const jsonSchema = convert(schema);
    // fs.writeFile("model.json", JSON.stringify(jsonSchema), function (err: any) {
    //   if (err) throw err;
    // });
    // fs.unlink("panacloud/lib/new-stack.ts", function (err: any) {
    //   if (err) throw err;
    // });
    // rimraf("panacloud/lambda-fns", function () { console.log("done"); });

    // await exec("yarn codegen")

    // start();
  }
}
