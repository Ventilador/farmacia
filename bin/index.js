console.log('starting');
const { spawn, execSync, spawnSync } = require('child_process');
const { existsSync } = require('fs');
if (!existsSync('node_modules')) {
    spawnSync('npm', ['install'], { shell: true });
}
if (process.env.NODE_ENV === 'prod') {

}
const childs = [
    spawn('node', ['./node_modules/webpack-dev-server/bin/webpack-dev-server.js', '--config', 'webpack.config.js'], {
        stdio: 'inherit', shell: true
    })
    , spawn('node', ['--inspect', '-r', './bin/ts-node.js', './mid/index.ts'], {
        stdio: 'inherit', shell: true
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