"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///<reference  path="node_modules/@arcaelas/xhrequest/index.ts" />
const utils_1 = require("@arcaelas/utils");
const pathToRegex = require('path-to-regex');
class Bridge {
    constructor() {
        this.routes = [];
        this.iterators = [];
    }
    use(...props) {
        let [path, ...iterators] = props;
        iterators.unshift(typeof path === 'string' ? new pathToRegex(path) : path);
        this.iterators.push(iterators.flat());
        return this;
    }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.get("/news", (req, res)=>{
     *      res.bridge( fetch("https://news.google.com/") );
     * });
     */
    get(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'GET' ? next() : next("route")].concat(...iterators)), this; }
    head(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'HEAD' ? next() : next("route")].concat(...iterators)), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.post("/publish", (req, res, next)=>{
     *  if(!req.headers.has("Authenticate")) next("Se requiere un token de sesión");
     *  else next();
     * });
     */
    post(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'POST' ? next() : next("route")].concat(...iterators)), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.put("/update/videos/123",{
     *  body: JSON.stringfy({ title: "Title", content:"Algun texto a enviar" })
     * }).then(res=> res.json());
     */
    put(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'PUT' ? next() : next("route")].concat(...iterators)), this; }
    /**
     * @description Esta función crea un bridge para la solicitud, siempre que corresponda al método indicado.
     * @example
     * bridge.delete("/videos/123").then(res=> res.json());
     */
    delete(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'DELETE' ? next() : next("route")].concat(...iterators)), this; }
    connect(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'CONNECT' ? next() : next("route")].concat(...iterators)), this; }
    options(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'OPTIONS' ? next() : next("route")].concat(...iterators)), this; }
    trace(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'TRACE' ? next() : next("route")].concat(...iterators)), this; }
    patch(path, ...iterators) { return (typeof path !== 'string') ? new utils_1.Fatal("type/string") : this.routes.push([new pathToRegex(path), (req, res, next) => req.method === 'PATCH' ? next() : next("route")].concat(...iterators)), this; }
    async fetch(url, init) {
        let result = null;
        const request = { method: 'GET', ...init, url, params: null, query: new URLSearchParams, };
        const response = {
            headers: new Headers(),
            send(content, options) {
                options = typeof options !== 'object' ? { status: Number(options), headers: response.headers } : options;
                options.headers || (options.headers = response.headers);
                result = Promise.resolve(new Response(content, options));
            },
            bridge(fetcher) { result = Promise.resolve(fetcher); },
        };
        for (let i = 0; !result && i < this.iterators.length; i++) {
            const group = this.iterators[i];
            if (typeof group[0] !== 'function') {
                if (!group[0].match(request.url))
                    continue;
                group.shift();
            }
            for (let handler of group) {
                let status = null;
                const next = (m = "tap") => {
                    if (typeof m === 'string' && !['route', 'tap'].includes(m))
                        status = new Error(m);
                    else
                        status = m;
                };
                await handler(request, response, next);
                if (result || status === 'route')
                    break;
                else if (status === 'tap')
                    continue;
                else if (status instanceof Error)
                    response.send(status.message, 502);
                break;
            }
        }
        for (let i = 0; !result && i < this.routes.length; i++) {
            const [regex, ...routes] = this.routes[i];
            let params = regex.match(url), status = null, next = (m = "tap") => (status = typeof m === 'string' && !['route', 'tap'].includes(m) ? new Error(m) : m);
            if (params) {
                request.params = params;
                for (let handler of routes) {
                    await handler(request, response, next);
                    if (status instanceof Error)
                        response.send(status.message, 502);
                    else if (status === 'tap')
                        continue;
                    else if (result || status === 'route')
                        break;
                }
                if (status === 'route')
                    continue;
                else
                    break;
            }
        }
        return result || new Response("ROUTE_NOT_FOUND", { status: 404 });
    }
}
exports.default = Bridge;
