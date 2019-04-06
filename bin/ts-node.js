const tsNode = require('ts-node');
tsNode.register({
  files: true,
  typeCheck: true,
  // ignore Blue/blue-middleware/node_modules, but not Blue/node_modules
  // which would else be ignored by default (/node_modules/)
  ignore: ['blue-middleware/node_modules']
});
