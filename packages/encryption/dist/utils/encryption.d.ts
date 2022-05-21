/// <reference types="node" />
import { Buffer } from 'node:buffer';
/**
    Implementation of using `aes-256-gcm` with node.js's `crypto` lib.
*/
export declare function aes256gcm(key: Buffer): {
    encrypt: (str: string) => {
        enc: Buffer;
        iv: Buffer;
        authTag: Buffer;
    };
    decrypt: (enc: string, iv: Buffer, authTag: Buffer) => string;
};
export declare function decryptAdminPassword({ encryptedAdminPassword, secretCode, maxSaltValue, }: {
    encryptedAdminPassword: string;
    secretCode: string;
    maxSaltValue: number;
}): Promise<string>;
