"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assert = _interopRequireDefault(require("assert"));

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

  const lifecyclePath = require.resolve('./lifecycles');

  const mountElementId = api.config.mountElementId || _common.defaultSlaveRootId;
  const app = api.config.mountElementId;
  const port = process.env.PORT;
  const protocol = process.env.HTTPS ? 'https' : 'http';
  api.modifyDefaultConfig(memo => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const _require = require((0, _path.join)(api.cwd, 'package.json')),
          pkgName = _require.name;

    return _objectSpread({}, memo, {
      // TODO 临时关闭，等这个 pr 合并 https://github.com/umijs/umi/pull/2866
      // disableGlobalVariables: true,
      base: `/${pkgName}`,
      mountElementId
    });
  });
  api.modifyWebpackConfig(memo => {
    memo.output.libraryTarget = 'umd';
    (0, _assert.default)(api.pkg.name, 'You should have name in package.json');
    memo.output.library = api.pkg.name;
    memo.output.jsonpFunction = `webpackJsonp_${api.pkg.name}`; // 配置 publicPath，支持 hot update

    if (process.env.NODE_ENV === 'development') {
      memo.output.publicPath = `${protocol}://localhost:${port}/`;
    }

    return memo;
  }); // 去掉source-map, 解决VS Code无法调试的问题
  // source-map 跨域设置
  //if (process.env.NODE_ENV === 'development') {
  //  // 变更 webpack-dev-server websocket 默认监听地址
  //  process.env.SOCKET_SERVER = `${protocol}://localhost:${port}/`;
  //  api.chainWebpackConfig(memo => {
  //    // 禁用 devtool，启用 SourceMapDevToolPlugin
  //    memo.devtool(false);
  //    memo.plugin('source-map').use(webpack.SourceMapDevToolPlugin, [
  //      {
  //        namespace: app,
  //        append: `\n//# sourceMappingURL=${protocol}://localhost:${port}/[url]`,
  //        filename: '[name].js.map',
  //      },
  //    ]);
  //  });
  //}

  api.writeTmpFile('qiankunContext.js', `
import { createContext, useContext } from 'react';

export const Context = createContext(null);
export function useRootExports() {
  return useContext(Context);
};
  `.trim());
  api.addUmiExports([{
    specifiers: ['useRootExports'],
    source: '@tmp/qiankunContext'
  }]);
  api.addEntryImport({
    source: lifecyclePath,
    specifier: '{ genMount as qiankun_genMount, genBootstrap as qiankun_genBootstrap, genUnmount as qiankun_genUnmount }'
  });
  api.addRendererWrapperWithModule(lifecyclePath);
  api.addEntryCode(`
    export const bootstrap = qiankun_genBootstrap(Promise.all(moduleBeforeRendererPromises), render);
    export const mount = qiankun_genMount();
    export const unmount = qiankun_genUnmount('${mountElementId}');
    
    if (!window.__POWERED_BY_QIANKUN__) {
      bootstrap().then(mount);
    }
    `);
}