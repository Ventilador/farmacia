import *as fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { homedir } from 'os';
import { Response } from 'express';
const readFile = fixDirName(promisify(fs.readFile));
const writeFile = fixDirName(promisify(fs.writeFile));
const stat = fixDirName(promisify(fs.stat));
const mkdir = fixDirName(promisify(fs.mkdir));
const readdir = fixDirName(promisify(fs.readdir));
const open = fixDirName(promisify(fs.open));

export const folder = join(homedir(), 'farmacia');
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}


export {
  readFile, writeFile, stat, mkdir, readdir, open, createSafeReadStream, createWriteStream
}

function createWriteStream(path: string) {
  return fs.createWriteStream(join(folder, path), {
    encoding: 'utf8',
    flags: 'w+'
  });
};

function createSafeReadStream(file: string, response: Response) {
  return fs.createReadStream(join(folder, file), {
    encoding: 'utf8'
  }).on('close', response.end.bind(response))
    .on('data', response.write.bind(response))
    .on('error', return404(response));
}


function return404(req) {
  return function () {
    req.writeHead(404);
    req.end();
  }
}

function fixDirName<T>(fn: T): T;
function fixDirName<T>(fn: any): T {
  return function (fileName, ...args) {
    args.unshift(join(folder, fileName));
    return fn.apply(this, args);
  } as any;
}
