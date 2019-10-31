"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.genBootstrap = genBootstrap;
exports.genMount = genMount;
exports.genUnmount = genUnmount;
exports.default = void 0;

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _common = require("../common");

// @ts-ignore
// @ts-ignore
const defer = {};
defer.promise = new Promise(resolve => {
  defer.resolve = resolve;
});
let render = _common.noop;
let hasMountedAtLeastOnce = false;

var _default = () => defer.promise;

exports.default = _default;

function getSlaveRuntime() {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const plugins = require('umi/_runtimePlugin');

  const config = plugins.mergeConfig('qiankun') || {};
  const slave = config.slave;
  return slave || config;
}

function genBootstrap(promises, oldRender) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = (0, _asyncToGenerator2.default)(function* (...args) {
        const slaveRuntime = getSlaveRuntime();
        if (slaveRuntime.bootstrap) yield slaveRuntime.bootstrap(...args);

        render = () => promises.then(oldRender).catch(e => {
          if (process.env.NODE_ENV === 'development') {
            console.error('Render failed', e);
          }
        });
      });

      return function () {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

function genMount() {
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = (0, _asyncToGenerator2.default)(function* (...args) {
        defer.resolve();
        const slaveRuntime = getSlaveRuntime();
        if (slaveRuntime.mount) yield slaveRuntime.mount(...args); // 第一次 mount umi 会自动触发 render，非第一次 mount 则需手动触发

        if (hasMountedAtLeastOnce) {
          render();
        }

        hasMountedAtLeastOnce = true;
      });

      return function () {
        return _ref2.apply(this, arguments);
      };
    }()
  );
}

function genUnmount(mountElementId) {
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = (0, _asyncToGenerator2.default)(function* (...args) {
        const container = document.getElementById(mountElementId);

        if (container) {
          _reactDom.default.unmountComponentAtNode(container);
        }

        const slaveRuntime = getSlaveRuntime();
        if (slaveRuntime.unmount) yield slaveRuntime.unmount(...args);
      });

      return function () {
        return _ref3.apply(this, arguments);
      };
    }()
  );
}