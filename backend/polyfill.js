import { fetch, Headers, Request, Response, ReadableStream } from 'undici';
import { webcrypto } from 'crypto';

globalThis.fetch = fetch;
globalThis.Headers = Headers;
globalThis.Request = Request;
globalThis.Response = Response;
globalThis.ReadableStream = ReadableStream;
globalThis.crypto = webcrypto;
