"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = require("fs");

var _path = require("path");

var _common = require("../common");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _default(api, options) {
  const _ref = options || {},
        _ref$registerRuntimeK = _ref.registerRuntimeKeyInIndex,
        registerRuntimeKeyInIndex = _ref$registerRuntimeK === void 0 ? false : _ref$registerRuntimeK;

  api.addRuntimePlugin(require.resolve('./runtimePlugin'));

  if (!registerRuntimeKeyInIndex) {
    api.addRuntimePluginKey('qiankun');
  }

  api.modifyDefaultConfig(config => _objectSpread({}, config, {
    mountElementId: _common.defaultMasterRootId,
    disableGlobalVariables: true
  }));
  const _api$config$history = api.config.history,
        history = _api$config$history === void 0 ? _common.defaultHistoryMode : _api$config$history; // apps 可能在构建期为空

  const _ref2 = options || {},
        _ref2$apps = _ref2.apps,
        apps = _ref2$apps === void 0 ? [] : _ref2$apps;

  function modifyAppRoutes(masterHistory) {
    api.modifyRoutes(routes => {
      const newRoutes = routes.map(route => {
        if (route.path === '/') {
          if (route.routes && route.routes.length) {
            apps.forEach(({
              history: slaveHistory = history,
              base
            }) => {
              // 当子应用的 history mode 跟主应用一致时，为避免出现 404 手动为主应用创建一个 path 为 子应用 rule 的空 div 路由组件
              if (slaveHistory === masterHistory) {
                const baseConfig = (0, _common.toArray)(base);
                baseConfig.forEach(basePath => route.routes.unshift({
                  path: `${basePath}/(.*)`,
                  component: `() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('${basePath} 404 mock rendered');
              }
              
              return React.createElement('div');
            }`
                }));
              }
            });
          }
        }

        return route;
      });
      return newRoutes;
    });
  }

  modifyAppRoutes(history);
  const rootExportsFile = (0, _path.join)(api.paths.absSrcPath, 'rootExports.js');
  api.addPageWatcher(rootExportsFile);
  api.onGenerateFiles(() => {
    const rootExports = `
window.g_rootExports = ${(0, _fs.existsSync)(rootExportsFile) ? `require('@/rootExports')` : `{}`};
    `.trim();
    api.writeTmpFile('qiankunRootExports.js', rootExports);
    api.writeTmpFile('subAppsConfig.json', JSON.stringify(_objectSpread({
      masterHistory: history
    }, options)));
  });
  api.writeTmpFile('qiankunDefer.js', `
      class Deferred { 
        constructor() {
          this.promise = new Promise(resolve => this.resolve = resolve);
        }
      }
      export const deferred = new Deferred();
      export const qiankunStart = deferred.resolve;
    `.trim());
  api.addUmiExports([{
    specifiers: ['qiankunStart'],
    source: '@tmp/qiankunDefer'
  }]);
}