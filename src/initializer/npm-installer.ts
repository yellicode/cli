/*
 * Copyright (c) 2018 Yellicode
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '@yellicode/core';

export class NpmInstaller {    
    constructor(private logger: Logger) {       
        
    }

	public installDevPackages(workingDir: string, packagePaths: string[]): Promise<void> {
		// The following will call installDevPackage sequentially so that we can report the
		// progress each event in order (and I don't know if installing in parallel is even recommended)	

		// A package.json is required in order to install anything
		let chain: Promise<void> = this.ensurePackageJson(workingDir); // or Promise.resolve();
		packagePaths.forEach(packagePath => {
			chain = chain.then(() => {
				const installCommandArgs = `install ${packagePath} --save-dev`;				
				return this.execNpmCommand(workingDir, installCommandArgs);
			});
		});
		return chain;
	}

	public installDevPackage(documentPath: string, packagePath: string): Promise<void> {
		const workingDir = path.dirname(documentPath);

		// A package.json is required in order to install anything
		return this.ensurePackageJson(workingDir)
			.then(() => {
				const installCommandArgs = `install ${packagePath} --save-dev`;
				return this.execNpmCommand(workingDir, installCommandArgs);
			});
	}

	private ensurePackageJson(workingDir: string): Promise<void> {
		const packageJsonPath = path.join(workingDir, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			return Promise.resolve();
		}
		// The following command creates a package.json without asking any further questions
		const npmInitCommand = 'init --yes'; // https://docs.npmjs.com/getting-started/using-a-package.json#the---yes-init-flag
		return this.execNpmCommand(workingDir, npmInitCommand);
	}

	private execNpmCommand(workingDir: string, commandArgs: string): Promise<void> {
		const command = `npm ${commandArgs}`;

		const options = { silent: false, cwd: workingDir };
		this.logger.verbose(`Executing npm command '${command}' in working directory ${workingDir}...`);
		return new Promise<void>((resolve, reject) => {
			// Using exec so that the process is launched with a shell (also requires the 'fix-path' package
			// on macOS to avoid a 'command not found' error due to the $PATH not being inherited when running the packaged app).
			// https://github.com/electron/electron/issues/7688
			const child = childProcess.exec(command, options, (error, stdout, stderr) => {
                // TODO: inject some logger
                if (stdout) this.logger.info(stdout);
				if (stderr) this.logger.error(stderr);
				if (error !== null) {
					reject(`Npm command '${command}' has failed. ${error}.`);
				}
			});

			child.on('exit', (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(`Npm command '${command}' has failed. The process has exited with code ${code}.`);
				}
			});
		});

	}
}
