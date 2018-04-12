/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { v4 as uuid } from 'node-uuid';
import * as os from 'os';

const HEX_LIST = '0123456789abcdef';
const B64_LIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const STRING_LENGTH = 22; // Actually 24 characters for a base64 encoded Guid, but the padding "==" is removed.

export class UniqueId {
    static isLittleEndian = os.endianness() === 'LE';

    public static create(): string {                
        const guid = uuid(); // Credits: https://github.com/kelektiv/node-uuid
        let encoded = UniqueId.guidToBase64(guid, UniqueId.isLittleEndian);
        // Modify for use in a URL https://en.wikipedia.org/wiki/Base64#URL_applications
		encoded = encoded.replace("/", "_").replace("+", "-");
        return encoded.substring(0, STRING_LENGTH); // remove the padding "=="
    }

    private static guidToBase64(g: string, le: boolean): string {
        // Credits: https://stackoverflow.com/a/9998010/9370196
        var s = g.replace(/[^0-9a-f]/ig, '').toLowerCase();
        if (s.length != 32) return '';

        if (le) s = s.slice(6, 8) + s.slice(4, 6) + s.slice(2, 4) + s.slice(0, 2) +
            s.slice(10, 12) + s.slice(8, 10) +
            s.slice(14, 16) + s.slice(12, 14) +
            s.slice(16);
        s += '0';

        var a, p, q;
        var r = '';
        var i = 0;
        while (i < 33) {
            a = (HEX_LIST.indexOf(s.charAt(i++)) << 8) |
                (HEX_LIST.indexOf(s.charAt(i++)) << 4) |
                (HEX_LIST.indexOf(s.charAt(i++)));

            p = a >> 6;
            q = a & 63;

            r += B64_LIST.charAt(p) + B64_LIST.charAt(q);
        }
        r += '==';

        return r;
    }
}