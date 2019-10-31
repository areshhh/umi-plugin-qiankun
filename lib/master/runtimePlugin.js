"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _qiankunDefer = require("@tmp/qiankunDefer.js");

require("@tmp/qiankunRootExports.js");

var _subAppsConfig = _interopRequireDefault(require("@tmp/subAppsConfig.json"));

var _assert = _interopRequireDefault(require("assert"));

var _qiankun = require("qiankun");

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _common = require("../common");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function getMasterRuntime() {
  return _getMasterRuntime.apply(this, arguments);
}

function _getMasterRuntime() {
  _getMasterRuntime = (0, _asyncToGenerator2.default)(function* () {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const plugins = require('umi/_runtimePlugin');

    const config = (yield plugins.mergeConfigAsync('qiankun')) || {};
    const master = config.master;
    return master || config;
  });
  return _getMasterRuntime.apply(this, arguments);
}

function render(_x) {
  return _render.apply(this, arguments);
}

function _render() {
  _render = (0, _asyncToGenerator2.default)(function* (oldRender) {
    oldRender();

    function isAppActive(location, history, base) {
      const baseConfig = (0, _common.toArray)(base);

      switch (history) {
        case 'hash':
          return baseConfig.some(pathPrefix => (0, _common.testPathWithPrefix)(`#${pathPrefix}`, location.hash));

        case 'browser':
          return baseConfig.some(pathPrefix => (0, _common.testPathWithPrefix)(pathPrefix, location.pathname));

        default:
          return false;
      }
    }

    const runtimeConfig = yield getMasterRuntime();

    const _ref = _objectSpread({}, _subAppsConfig.default, {}, runtimeConfig),
          apps = _ref.apps,
          _ref$jsSandbox = _ref.jsSandbox,
          jsSandbox = _ref$jsSandbox === void 0 ? false : _ref$jsSandbox,
          _ref$prefetch = _ref.prefetch,
          prefetch = _ref$prefetch === void 0 ? true : _ref$prefetch,
          _ref$defer = _ref.defer,
          defer = _ref$defer === void 0 ? false : _ref$defer,
          lifeCycles = _ref.lifeCycles,
          masterHistory = _ref.masterHistory,
          otherConfigs = (0, _objectWithoutProperties2.default)(_ref, ["apps", "jsSandbox", "prefetch", "defer", "lifeCycles", "masterHistory"]);

    (0, _assert.default)(apps && apps.length, 'sub apps must be config when using umi-plugin-qiankun');
    (0, _qiankun.registerMicroApps)(apps.map(({
      name,
      entry,
      base,
      history = masterHistory,
      mountElementId = _common.defaultMountContainerId,
      props
    }) => ({
      name,
      entry,
      activeRule: location => isAppActive(location, history, base),
      render: ({
        appContent,
        loading
      }) => {
        if (process.env.NODE_ENV === 'development') {
          console.info(`app ${name} loading ${loading}`);
        }

        if (mountElementId) {
          const container = document.getElementById(mountElementId);

          if (container) {
            const subApp = _react.default.createElement('div', {
              dangerouslySetInnerHTML: {
                __html: appContent
              }
            });

            _reactDom.default.render(subApp, container);
          }
        }
      },
      props: _objectSpread({
        base,
        history
      }, props)
    })), lifeCycles);

    if (defer) {
      yield _qiankunDefer.deferred.promise;
    }

    (0, _qiankun.start)(_objectSpread({
      jsSandbox,
      prefetch
    }, otherConfigs));
  });
  return _render.apply(this, arguments);
}