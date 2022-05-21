'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var execa = require('@commonjs/execa');
var node_buffer = require('node:buffer');
var crypto = require('node:crypto');
var path = require('node:path');
var node_url = require('node:url');
var process = require('node:process');
var fs = require('node:fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var execa__default = /*#__PURE__*/_interopDefaultLegacy(execa);
var crypto__namespace = /*#__PURE__*/_interopNamespace(crypto);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var path__namespace = /*#__PURE__*/_interopNamespace(path);
var process__default = /*#__PURE__*/_interopDefaultLegacy(process);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const copyProperty = (to, from, property, ignoreNonConfigurable) => {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') {
		return;
	}

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') {
		return;
	}

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, fromDescriptor);
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = function (toDescriptor, fromDescriptor) {
	return toDescriptor === undefined || toDescriptor.configurable || (
		toDescriptor.writable === fromDescriptor.writable &&
		toDescriptor.enumerable === fromDescriptor.enumerable &&
		toDescriptor.configurable === fromDescriptor.configurable &&
		(toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
	);
};

const changePrototype = (to, from) => {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) {
		return;
	}

	Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to, from, name) => {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName);
	Object.defineProperty(to, 'toString', {...toStringDescriptor, value: newToString});
};

function mimicFunction(to, from, {ignoreNonConfigurable = false} = {}) {
	const {name} = to;

	for (const property of Reflect.ownKeys(from)) {
		copyProperty(to, from, property, ignoreNonConfigurable);
	}

	changePrototype(to, from);
	changeToString(to, from, name);

	return to;
}

const calledFunctions = new WeakMap();

const onetime = (function_, options = {}) => {
	if (typeof function_ !== 'function') {
		throw new TypeError('Expected a function');
	}

	let returnValue;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = function (...arguments_) {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_.apply(this, arguments_);
			function_ = null;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	mimicFunction(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile',
};

function checkType(type) {
	if (type in typeMappings) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();

const toPath$1 = urlOrPath => urlOrPath instanceof URL ? node_url.fileURLToPath(urlOrPath) : urlOrPath;

function locatePathSync(
	paths,
	{
		cwd = process__default["default"].cwd(),
		type = 'file',
		allowSymlinks = true,
	} = {},
) {
	checkType(type);
	cwd = toPath$1(cwd);

	const statFunction = allowSymlinks ? fs__default["default"].statSync : fs__default["default"].lstatSync;

	for (const path_ of paths) {
		try {
			const stat = statFunction(path__default["default"].resolve(cwd, path_));

			if (matchType(type, stat)) {
				return path_;
			}
		} catch {}
	}
}

const toPath = urlOrPath => urlOrPath instanceof URL ? node_url.fileURLToPath(urlOrPath) : urlOrPath;

const findUpStop = Symbol('findUpStop');

function findUpMultipleSync(name, options = {}) {
	let directory = path__default["default"].resolve(toPath(options.cwd) || '');
	const {root} = path__default["default"].parse(directory);
	const stopAt = options.stopAt || root;
	const limit = options.limit || Number.POSITIVE_INFINITY;
	const paths = [name].flat();

	const runMatcher = locateOptions => {
		if (typeof name !== 'function') {
			return locatePathSync(paths, locateOptions);
		}

		const foundPath = name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePathSync([foundPath], locateOptions);
		}

		return foundPath;
	};

	const matches = [];
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const foundPath = runMatcher({...options, cwd: directory});

		if (foundPath === findUpStop) {
			break;
		}

		if (foundPath) {
			matches.push(path__default["default"].resolve(directory, foundPath));
		}

		if (directory === stopAt || matches.length >= limit) {
			break;
		}

		directory = path__default["default"].dirname(directory);
	}

	return matches;
}

function findUpSync(name, options = {}) {
	const matches = findUpMultipleSync(name, {...options, limit: 1});
	return matches[0];
}

function packageDirectorySync({cwd} = {}) {
	const filePath = findUpSync('package.json', {cwd});
	return filePath && path__default["default"].dirname(filePath);
}

const getBruteForcerExecutablePath = onetime(() => {
    // eslint-disable-next-line unicorn/prefer-module
    const rootDir = packageDirectorySync({ cwd: __dirname });
    return path__namespace.join(rootDir, 'encryption-brute-forcer/target/release/encryption-brute-forcer');
});

/**
    Implementation of using `aes-256-gcm` with node.js's `crypto` lib.
*/
function aes256gcm(key) {
    const ALGO = 'aes-256-gcm';
    // encrypt returns base64-encoded ciphertext
    function encrypt(str) {
        // The `iv` for a given key must be globally unique to prevent
        // against forgery attacks. `randomBytes` is convenient for
        // demonstration but a poor way to achieve this in practice.
        //
        // See: e.g. https://csrc.nist.gov/publications/detail/sp/800-38d/final
        const iv = node_buffer.Buffer.from('unique nonce', 'utf8');
        const cipher = crypto__namespace.createCipheriv(ALGO, key, iv);
        // Hint: Larger inputs (it's GCM, after all!) should use the stream API
        let enc = cipher.update(str, 'utf8', 'base64');
        enc += cipher.final('base64');
        return {
            enc: node_buffer.Buffer.from(enc, 'base64'),
            iv,
            authTag: cipher.getAuthTag(),
        };
    }
    // decrypt decodes base64-encoded ciphertext into a utf8-encoded string
    function decrypt(enc, iv, authTag) {
        const decipher = crypto__namespace.createDecipheriv(ALGO, key, iv);
        decipher.setAuthTag(authTag);
        let str = decipher.update(enc, 'base64', 'utf8');
        str += decipher.final('utf8');
        return str;
    }
    return {
        encrypt,
        decrypt,
    };
}
async function decryptAdminPassword({ encryptedAdminPassword, secretCode, maxSaltValue, }) {
    const bruteForcerPath = getBruteForcerExecutablePath();
    if (secretCode.length !== 5) {
        throw new Error('Secret code must be 5 characters in length.');
    }
    const encryptionBruteForcerProcess = execa__default["default"](bruteForcerPath, [
        'decrypt',
        encryptedAdminPassword,
        secretCode,
        String(maxSaltValue),
    ]);
    const timeout = setTimeout(() => {
        encryptionBruteForcerProcess.kill('SIGINT');
        throw new Error('Could not decrypt admin password after 30 seconds. Please check that the secret code provided was correct.');
    }, 30000);
    const result = await encryptionBruteForcerProcess;
    clearTimeout(timeout);
    return result.stdout;
}

async function measureMaxSaltValue() {
    const bruteForcerPath = getBruteForcerExecutablePath();
    const encryptionBruteForcerProcess = execa__default["default"](bruteForcerPath, ['benchmark']);
    const numSeconds = 5;
    setTimeout(() => {
        encryptionBruteForcerProcess.kill('SIGINT');
    }, numSeconds * 1000);
    const result = await encryptionBruteForcerProcess;
    // This is how many brute-force attempts on the key the user's machine can try per second
    const attemptsPerSecond = Number(result.stdout) / numSeconds;
    // We want brute-forcing to find the correct salt for a known code to take around 7 seconds, so we multiply this by 7 to get the maximum value of the salt
    const maxSaltValue = Math.ceil(attemptsPerSecond * 7);
    return maxSaltValue;
}

exports.aes256gcm = aes256gcm;
exports.decryptAdminPassword = decryptAdminPassword;
exports.measureMaxSaltValue = measureMaxSaltValue;
