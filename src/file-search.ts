/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Stats } from "fs";
const fs = require('fs');
const path = require('path');

export class FileSearch {
    private static _directoryIgnoreList: string[] = ['node_modules'];

    public static findFiles(dirName: string, recursive: boolean, fileName: string, callback: (err: any, list: string[] | null) => void): void {
        // Recursively search the working dir for files matching fileName.
        //console.log('CodeGen: findFilesRecursive on directory \'%s\'', dirName);

        fs.readdir(dirName, (err: any, files: string[]) => {
            if (err) {
                return callback(err, null);
            }

            let list: string[] = [];
            let pending = files.length;
            if (pending === 0) {
                // we are done
                callback(null, list);
                return;
            }

            var onFileHandled = () => {
                pending -= 1;
                if (pending === 0) {
                    // We are done reading through the file list
                    callback(null, list);
                    return;
                }
            };

            files.forEach(file => {
                const filePath = path.join(dirName, file);
                fs.stat(filePath, (errStat: NodeJS.ErrnoException, stats: Stats) => {
                    if (errStat) {
                        return callback(errStat, null);
                    }
                    var baseName = path.basename(file);
                    if (recursive && stats.isDirectory()) {
                        if (FileSearch._directoryIgnoreList.indexOf(baseName) <= -1) {
                            // Recursively read on
                            FileSearch.findFiles(filePath, true, fileName, (errSubDir, subDirList: string[] | null) => {
                                if (subDirList && subDirList.length > 0) {
                                    list = list.concat(subDirList);
                                }
                                onFileHandled();
                            });
                        } else {
                            onFileHandled();
                        }
                    } else {
                        if (baseName.toLowerCase() === fileName) {
                            list.push(filePath);
                        }
                        onFileHandled();
                    }
                    //   console.log('CodeGen: pending in directory \'%s\': %s', dirName, pending);
                });
            });
        });
    }
}