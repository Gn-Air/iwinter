import { Engine, engineSymbolKey } from '../engines/baseEngine';
import { beforeSymbolKey, afterSymbolKey } from '../decorators/hooks';
import {
    pathParamSymbolKey,
    queryParamSymbolKey,
    bodyParamSymbolKey,
    reqParamSymbolKey,
    resParamSymbolKey,
    ctxParamSymbolKey,
    nextParamSymbolKey,
    originParamSymbolKey
} from './param';

export const rootPathSymbolKey = Symbol.for('winter:rootPath');
export const rootAuthSymbolKey = Symbol.for('winter:rootAuth');
export const pathSymbolKey = Symbol.for('winter:path');
export const methodsSymbolKey = Symbol.for('winter:methods');

export const Path = (path: string, authFunc?: Function): Function => {
    const engineType = Reflect.getMetadata(engineSymbolKey, Engine.prototype);
    return (target: any, propertyKey: string, decorator: TypedPropertyDescriptor<Function>) => {
        if (propertyKey == undefined && decorator == undefined) {
            Reflect.defineMetadata(rootPathSymbolKey, path, target.prototype);
            Reflect.defineMetadata(rootAuthSymbolKey, authFunc, target.prototype);
        } else {
            let methods = Reflect.getMetadata(methodsSymbolKey, target) || [];
            methods.push(propertyKey);
            Reflect.defineMetadata(methodsSymbolKey, methods, target);
            Reflect.defineMetadata(pathSymbolKey, path, target, propertyKey);
            let oldMethod = decorator.value;
            if (engineType == 'koaEngine') {
                decorator.value = (instance) => async (ctx, next) => {
                    /**
                     * 权限拦截，
                     * 判断是否有控制器权限
                     * 判断是否有路由权限
                     */
                    let controllerAuth = Reflect.getMetadata(rootAuthSymbolKey, target);
                    if (controllerAuth && typeof controllerAuth == 'function') {
                        let hasAuth = await controllerAuth(ctx, next);
                        if (!hasAuth) {
                            ctx.response.status = 403;
                            ctx.response.body = 'Permission Denied!';
                            return null;
                        }
                    }
                    if (authFunc && typeof authFunc == 'function') {
                        let hasAuth = await authFunc(ctx, next);
                        if (!hasAuth) {
                            ctx.response.status = 403;
                            ctx.response.body = 'Permission Denied!';
                            return null;
                        }
                    }
                    let params = [];
                    //路径参数
                    let pathParams = Reflect.getMetadata(pathParamSymbolKey, target, propertyKey);
                    if (pathParams) {
                        Object.keys(pathParams).map(key => params[pathParams[key]] = ctx.params[key]);
                    }
                    //查询参数
                    let queryParams = Reflect.getMetadata(queryParamSymbolKey, target, propertyKey);
                    if (queryParams) {
                        Object.keys(queryParams).map(key => params[queryParams[key]] = ctx.query);
                    }
                    //请求体body
                    let bodyParams = Reflect.getMetadata(bodyParamSymbolKey, target, propertyKey);
                    if (bodyParams) {
                        Object.keys(bodyParams).map(key => params[bodyParams[key]] = ctx.request.body);
                    }
                    //请求上下文对象
                    let ctxObject = Reflect.getMetadata(ctxParamSymbolKey, target, propertyKey);
                    if (ctxObject) {
                        Object.keys(ctxObject).map(key => params[ctxObject[key]] = ctx);
                    }
                    //next 方法
                    let nextObject = Reflect.getMetadata(nextParamSymbolKey, target, propertyKey);
                    if (nextObject) {
                        Object.keys(nextObject).map(key => params[nextObject[key]] = next);
                    }
                    //原始参数对象
                    let originObject = Reflect.getMetadata(originParamSymbolKey, target, propertyKey);
                    if (originObject) {
                        Object.keys(originObject).map(key => params[originObject[key]] = { ctx, next });
                    }
                    //执行之前获取前置钩子函数并执行
                    let beforeHook = Reflect.getMetadata(beforeSymbolKey, target, propertyKey);
                    if(beforeHook && typeof beforeHook == 'function' ) {
                        await beforeHook(ctx, next);
                    }

                    let result = await oldMethod.apply(instance, params);

                    //执行之后获取后置钩子函数并执行
                    let afterHook = Reflect.getMetadata(afterSymbolKey, target, propertyKey);
                    if(afterHook && typeof afterHook == 'function' ) {
                        await afterHook(ctx, next);
                    }
                    ctx.response.body = result;
                }
            } else if (engineType == 'expressEngine') {
                decorator.value = (instance) => async (req, res, next) => {
                    /**
                     * 权限拦截，
                     * 判断是否有控制器权限
                     * 判断是否有路由权限
                     */
                    let controllerAuth = Reflect.getMetadata(rootAuthSymbolKey, target);
                    if (controllerAuth && typeof controllerAuth == 'function') {
                        let hasAuth = await controllerAuth(req, res);
                        if (!hasAuth) {
                            res.status(403).send('Permission Denied!');
                            return null;
                        }
                    }
                    if (authFunc && typeof authFunc == 'function') {
                        let hasAuth = await authFunc(req, res);
                        if (!hasAuth) {
                            res.status(403).send('Permission Denied!');
                            return null;
                        }
                    }
                    let params = [];
                    let pathParams = Reflect.getMetadata(pathParamSymbolKey, target, propertyKey);
                    //路径参数
                    if (pathParams) {
                        Object.keys(pathParams).map(key => params[pathParams[key]] = req.params[key]);
                    }
                    //查询参数
                    let queryParams = Reflect.getMetadata(queryParamSymbolKey, target, propertyKey);
                    if (queryParams) {
                        Object.keys(queryParams).map(key => params[queryParams[key]] = req.query);
                    }
                    //请求体body
                    let bodyParams = Reflect.getMetadata(bodyParamSymbolKey, target, propertyKey);
                    if (bodyParams) {
                        Object.keys(bodyParams).map(key => params[bodyParams[key]] = req.body);
                    }
                    //请求对象
                    let reqObject = Reflect.getMetadata(reqParamSymbolKey, target, propertyKey);
                    if (reqObject) {
                        Object.keys(reqObject).map(key => params[reqObject[key]] = req);
                    }
                    //响应对象
                    let resObject = Reflect.getMetadata(resParamSymbolKey, target, propertyKey);
                    if (resObject) {
                        Object.keys(resObject).map(key => params[resObject[key]] = res);
                    }
                    //next 方法
                    let nextObject = Reflect.getMetadata(nextParamSymbolKey, target, propertyKey);
                    if (nextObject) {
                        Object.keys(nextObject).map(key => params[nextObject[key]] = next);
                    }
                    //原始参数对象
                    let originObject = Reflect.getMetadata(originParamSymbolKey, target, propertyKey);
                    if (originObject) {
                        Object.keys(originObject).map(key => params[originObject[key]] = { req, res, next });
                    }
                    //执行之前获取前置钩子函数并执行
                    let beforeHook = Reflect.getMetadata(beforeSymbolKey, target, propertyKey);
                    if(beforeHook && typeof beforeHook == 'function' ) {
                        await beforeHook(req, res, next);
                    }

                    let result = await oldMethod.apply(instance, params);

                    //执行之后获取后置钩子函数并执行
                    let afterHook = Reflect.getMetadata(afterSymbolKey, target, propertyKey);
                    if(afterHook && typeof afterHook == 'function' ) {
                        await afterHook(req, res, next);
                    }
                    Promise.resolve(result).then(
                        (fulfilled) => {
                            res.send(fulfilled);
                        },
                        (rejected) => {
                            console.error(rejected);
                            res.status(500).send(rejected);
                        }
                    );
                };
            }
        }
    };
};