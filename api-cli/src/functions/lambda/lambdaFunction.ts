import { CodeWriter, TextWriter } from "@yellicode/core";
import { TypeScriptWriter } from "@yellicode/typescript";

export class LambdaFunction extends CodeWriter {
  public initializeLambdaFunction(content: any, output: TextWriter) {
    const ts = new TypeScriptWriter(output);
    ts.writeLine(`exports.handler = async (event:Event) => {`);
    ts.writeLine(`switch (event.info.fieldName) {`);
    ts.writeLine();
    content();
    ts.writeLine();
    ts.writeLine(`}`);
    ts.writeLine(`}`);
  }
  public importIndividualFunction(
    output: TextWriter,
    name: string,
    path: string
  ) {
    const ts = new TypeScriptWriter(output);
    ts.writeImports(path, [name]);
  }
}
