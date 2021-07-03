import { CodeWriter, TextWriter } from "@yellicode/core";
import { TypeScriptWriter, ClassDefinition } from "@yellicode/typescript";

export class BasicClass extends CodeWriter {
  public initializeClass(
    name: string,
    contents: (writer: TypeScriptWriter) => void,
    output: TextWriter
  ) {
    const ts = new TypeScriptWriter(output);
    const classDefinition: ClassDefinition = {
      name: name,
      extends: ["cdk.stack"],
      export: true,
    };
    ts.writeClassBlock(classDefinition, contents);
  }
}
