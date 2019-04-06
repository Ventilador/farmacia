import *as fs from 'fs';
import { promisify } from 'util';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const open = promisify(fs.open);


export {
    readFile, writeFile, stat, mkdir, readdir, open, createSafeReadStream, createWriteStream
}

function createWriteStream(path: string) {
    return fs.createWriteStream(path, {
        encoding: 'utf8',
        flags: 'w+'
    });
};

function createSafeReadStream(file: string, response: any) {
    open(file, fs.constants.W_OK)
        .then(fd => fs.createReadStream(file as any, {
            encoding: 'utf8',
            fd: fd
        }).pipe(response), returnEmpty(response));
}


function returnEmpty(req) {
    return function () {
        req.writeHead(200);
        req.write('');
        req.end();
    }
}