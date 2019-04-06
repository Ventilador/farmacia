console.log('starting');
const { spawn, execSync } = require('child_process');
const childs = [
    spawn('node', ['./node_modules/webpack-dev-server/bin/webpack-dev-server.js', '--config', 'webpack.config.js'], {
        stdio: 'inherit'
    }),
    spawn('node', ['--inspect', '-r', './bin/ts-node.js', './mid/index.ts'], {
        stdio: 'inherit'
    })
    .on('exit', () => console.log('exiting'))
];
process.on('exit', () => {
    childs.forEach((pid) => {
        if (!pid.killed) {
            execSync('taskkill /pid ' + pid + ' /T /F');
        }
    });
});