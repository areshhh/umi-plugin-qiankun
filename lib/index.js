"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _assert = _interopRequireDefault(require("assert"));

var _master = _interopRequireDefault(require("./master"));

var _slave = _interopRequireDefault(require("./slave"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _default(api, options) {
  api.addRuntimePluginKey('qiankun'); // 监听插件配置变化

  api.onOptionChange(newOpts => {
    const _ref = newOpts || {},
          masterOpts = _ref.master,
          slaveOpts = _ref.slave;

    (0, _assert.default)(!(masterOpts && slaveOpts), '请勿同时配置 master 和 slave 配置项');

    if (masterOpts) {
      api.changePluginOption('qiankun-master', _objectSpread({}, masterOpts, {
        registerRuntimeKeyInIndex: true
      }));
    } else {
      api.changePluginOption('qiankun-slave', _objectSpread({}, slaveOpts, {
        registerRuntimeKeyInIndex: true
      }));
    }
  });

  const _ref2 = options || {},
        masterOpts = _ref2.master,
        slaveOpts = _ref2.slave;

  (0, _assert.default)(!(masterOpts && slaveOpts), '请勿同时配置 master 和 slave 配置项');

  if (masterOpts) {
    api.registerPlugin({
      id: 'qiankun-master',
      apply: _master.default,
      opts: _objectSpread({}, masterOpts, {
        registerRuntimeKeyInIndex: true
      })
    });
  } else {
    api.registerPlugin({
      id: 'qiankun-slave',
      apply: _slave.default,
      opts: _objectSpread({}, slaveOpts, {
        registerRuntimeKeyInIndex: true
      })
    });
  }
}