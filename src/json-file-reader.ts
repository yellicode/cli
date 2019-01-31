/*
 * Copyright (c) 2019 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const fs = require('fs');
const jsonparser = require('json-parser');

export class JsonFileReader {

    public static readFile(fileName: string): Promise<any> {
        if (!fs.existsSync(fileName)) {
            return Promise.reject(`File '${fileName}' not found.`);
        }

        return new Promise<void>((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (err: NodeJS.ErrnoException, text: Buffer) => {
                try {
                    const model = jsonparser.parse(text, null, true); // parse... true to remove comments
                    resolve(model);
                } catch (e) {
                    reject(`Error parsing file '${fileName}': ${e}`);
                }
            });
        })
    }
}