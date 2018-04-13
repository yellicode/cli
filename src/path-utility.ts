/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
export class PathUtility {
    public static ensureJsExtension(path: string): string {
        if (!path)
            return path;

        if (path.endsWith('.js')) {
            return path;
        }

        if (path.endsWith('.ts')) {
            // Remove the .ts extension
            path = path.substring(0, path.length - 3);
        }
        return path + '.js';
    }

    public static removeTsExtension(path: string): string {
        if (!path || !path.endsWith('.ts'))
            return path;

        return path.substring(0, path.length - 3);
    }
}