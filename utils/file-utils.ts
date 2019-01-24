'use strict';

import fs from 'fs';

import path from 'path';

import * as textUtils from './text-utils';

import childProcess from 'child_process';
/* globals gT, gIn */

// TODO: сделать так, чтобы тесты работали под правами специально заведеного юзера.
// У этого юзера будет доступ к тестовой директории только на чтение.
// Права на запись у него будут только в его home.
// Перед тестом (после подключения всех require), юзер процесса будет подменяться (process.setuid(id)).
// Весь test suite будет копироваться в директорию юзера и работать оттуда.
// gT.fileUtilsCheckPath = function(path){
//
// };

/**
 * Checks that file or directory absent by statSync, without checking for catch reason (ENOENT or no).
 *
 * @param fileOrDirPath
 * @returns {boolean}
 */
export function isAbsent(fileOrDirPath: string) {
  try {
    fs.statSync(fileOrDirPath);
  } catch (e) {
    return true;
  }
  return false;
};

export function isEtalonAbsent(jsPath: string) {
  const etPath = textUtils.jsToEt(jsPath);
  try {
    fs.statSync(etPath);
  } catch (e) {
    return true;
  }
  return false;
};

export function safeUnlink(fileOrDirPath: string) {
  try {
    fs.unlinkSync(fileOrDirPath);
  } catch (e) {
    // No handling intentionaly.
  }
};

export function safeReadFile(fileOrDirPath: string) {
  let res = '';
  try {
    res = fs.readFileSync(fileOrDirPath, gT.engineConsts.logEncoding);
  } catch (e) {
    const asd = 5;
    // No handling intentionaly.
  }
  return res;
};

export function backupDif(fileOrDirPath: string) {
  try {
    fs.renameSync(fileOrDirPath, `${fileOrDirPath}.old`);
  } catch (e) {
    // No handling intentionaly.
  }
};

export function rmPngs(jsPath: string) {
  const dir = path.dirname(jsPath);
  const start = path.basename(textUtils.changeExt(jsPath, ''));

  fs.readdirSync(dir).forEach((fileName) => {
    const filePath = path.join(dir, fileName);
    if (!exports.isDirectory(filePath)
      && filePath.endsWith('.png')
      && fileName.startsWith(start)) {
      exports.safeUnlink(filePath);
    }
  });
};

export function rmDir(dir: string, removeSelf: boolean) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return;
  }
  if (files.length > 0) {
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fdata = fs.lstatSync(filePath);
      try {
        if (fdata.isSymbolicLink()) {
          fs.unlinkSync(filePath);
        }
        if (fdata.isFile()) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        gIn.tracer.err(`rmDir: ${gIn.textUtils.excToStr(e)}`);
      }
      if (fdata.isDirectory()) {
        exports.rmDir(filePath, true);
      }
    }
  }
  if (removeSelf) {
    fs.rmdirSync(dir);
  }
};

export function emptyDir(dir: string) {
  exports.rmDir(dir);
};

export function safeRename(oldPath: string, newPath: string) {
  exports.safeUnlink(newPath);
  try {
    fs.renameSync(oldPath, newPath);
  } catch (e) {
    // No handling intentionaly.
  }
};

// Removes file, if exists.
export function createEmptyFileSync(fileOrDirPath: string) {
  fs.closeSync(fs.openSync(fileOrDirPath, 'w'));
};

export function createEmptyLog(fileOrDirPath: string) {
  gIn.logger.logFile = gIn.textUtils.jsToLog(fileOrDirPath);
  exports.createEmptyFileSync(gIn.logger.logFile);
};

export function fileToStdout(file: string) {
  console.log(fs.readFileSync(file, { encoding: gT.engineConsts.logEncoding }));
};

export function fileToStderr(file: string) {
  // console.error(fs.readFileSync(file, {encoding: gT.engineConsts.logEncoding}));
  gIn.cLogger.errln(fs.readFileSync(file, { encoding: gT.engineConsts.logEncoding }));
};

export function saveJson(obj: any, file: string) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), { encoding: gT.engineConsts.logEncoding });
};

function collectArcPaths(dirInfo, arcPaths: string[]) {
  if (!dirInfo.diffed) {
    return;
  }

  // Absense of 'children' property says that it is test and not directory,
  // we should not allow to use this function for not directory.
  for (const curInfo of dirInfo.children) { // eslint-disable-line no-restricted-syntax
    if (Object.prototype.hasOwnProperty.call(curInfo, 'children')) {
      collectArcPaths(curInfo, arcPaths);
    } else if (curInfo.diffed) {
      arcPaths.push(gIn.textUtils.changeExt(curInfo.path, ''));
    }
  }
}

export function getDirectoryAlias(dirPath) {
  const pathArr = dirPath.split(path.sep);
  const last = pathArr.pop();
  if (last !== gT.engineConsts.suiteDirName) {
    throw new Error(`getDirectoryAlias: Incorrect path format: ${dirPath}`);
  }
  const alias = pathArr.pop();
  if (!alias) {
    throw new Error(`getDirectoryAlias: Incorrect path format: ${dirPath}`);
  }
  return alias;
};

export function archiveSuiteDir(dirInfo) {
  if (!gIn.params.enableEmail || !gT.suiteConfig.attachArchiveToMail || !gT.suiteConfig.mailRecipientList) {
    return null;
  }

  const alias = exports.getDirectoryAlias(dirInfo.path);

  const arcName = `${alias}_${new Date().toISOString().slice(0, 19).replace(/:/g, '_')}.zip`;

  const suitePathWOSuiteDirName = path.resolve(gIn.params.rootDir, dirInfo.path, '..');
  const wholeSuiteArcRelPath = path.relative(suitePathWOSuiteDirName, dirInfo.path);
  const resultArchivePath = path.resolve(suitePathWOSuiteDirName, arcName);

  if (!gT.suiteConfig.attachOnlyDiffs) {
    try {
      childProcess.execSync(
        `cd ${suitePathWOSuiteDirName} && zip -r ${arcName} "${wholeSuiteArcRelPath}"/*`,
        {
          stdio: [null, null, null],
          windowsHide: true,
        }
      );
    } catch (e) {
      gIn.tracer.err(`zip stderr: ${e.stderr.toString()}`);
      gIn.tracer.err(`zip stdout: ${e.stdout.toString()}`);
      throw (new Error('Error with zip (whole)'));
    }
    return resultArchivePath;
  }

  // Only diffs handling.
  const diffedPathsToArc = [];

  collectArcPaths(dirInfo, diffedPathsToArc);

  if (diffedPathsToArc.length === 0) {
    gIn.tracer.msg3('Archieve: No diffs, no archieve');
    return null;
  }

  const diffedRelativePathsToArc = diffedPathsToArc.map((diffedArcPath) => {
    const relativePath = `"${path.relative(suitePathWOSuiteDirName, diffedArcPath)}"*`;
    return relativePath;
  });

  try {
    childProcess.execSync(
      `cd ${suitePathWOSuiteDirName} && zip -r ${arcName} ${diffedRelativePathsToArc.join(' ')}`,
      { stdio: [null, null, null] }
    );
  } catch (e) {
    gIn.tracer.err(`zip stderr: ${e.stderr.toString()}`);
    gIn.tracer.err(`zip stdout: ${e.stdout.toString()}`);
    throw (new Error('Error with zip (diffs only)'));
  }

  return resultArchivePath;
};

export function isDirectory(fileOrDirPath: string) {
  let stat;
  try {
    stat = fs.statSync(fileOrDirPath);
  } catch (e) {
    return false;
  }

  return stat.isDirectory();
};

export function mkdir(dirPath: string) {
  try {
    fs.mkdirSync(dirPath);
  } catch (e) {

  }
};

export function mkDirRecursive(targetDir: string, subDirsArr: string[]): void {
  let curPath = targetDir;
  subDirsArr.forEach((dir) => {
    curPath = path.join(curPath, dir);
    exports.mkdir(curPath);
  });
};

export function rmLastDirSep(dir: string): string {
  if (dir[dir.length - 1] === path.sep) {
    return dir.slice(0, -1);
  }
  return dir;
};

// One of filenames.
export function whichDirContain(base: string, fileNames: string[], excludeThisBase: string) {
  const dirList = fs.readdirSync(base);

  for (const name of dirList) {
    const newBase = path.join(base, name);

    if (newBase === excludeThisBase) {
      continue;
    }

    if (fileNames.includes(name)) {
      return base;
    }

    if (fs.statSync(newBase).isDirectory()) {
      const dir = exports.whichDirContain(newBase, fileNames, excludeThisBase);
      if (dir) {
        return dir;
      }
    }
  }

  return null;
};
