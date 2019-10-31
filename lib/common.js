"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = toArray;
exports.testPathWithPrefix = testPathWithPrefix;
exports.noop = exports.defaultHistoryMode = exports.defaultSlaveRootId = exports.defaultMasterRootId = exports.defaultMountContainerId = void 0;

/**
 * @author Kuitos
 * @since 2019-06-20
 */
const defaultMountContainerId = 'root-subapp'; // 主应用跟子应用的默认 root id 区分开，避免冲突

exports.defaultMountContainerId = defaultMountContainerId;
const defaultMasterRootId = 'root-master';
exports.defaultMasterRootId = defaultMasterRootId;
const defaultSlaveRootId = 'root-slave';
exports.defaultSlaveRootId = defaultSlaveRootId;
const defaultHistoryMode = 'browser'; // @formatter:off

exports.defaultHistoryMode = defaultHistoryMode;

const noop = () => {}; // @formatter:on


exports.noop = noop;

function toArray(source) {
  return Array.isArray(source) ? source : [source];
}

function testPathWithPrefix(pathPrefix, realPath) {
  const pathRegex = new RegExp(`^${pathPrefix}(\\/|\\?)+.*$`, 'g');
  const normalizedPath = `${realPath}/`;
  return pathRegex.test(normalizedPath);
}