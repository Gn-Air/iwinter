export const pathParamSymbolKey = Symbol.for('winter:pathParam');
export const queryParamSymbolKey = Symbol.for('winter:queryParam');
export const bodyParamSymbolKey = Symbol.for('winter:bodyParam');
export const reqParamSymbolKey = Symbol.for('winter:reqParam');
export const resParamSymbolKey = Symbol.for('winter:resParam');
export const ctxParamSymbolKey = Symbol.for('winter:ctxParam');
export const nextParamSymbolKey = Symbol.for('winter:nextParam');
export const originParamSymbolKey = Symbol.for('winter:originParam');
const genParam = (symbolKey) => {
    return (paramName) => {
        return (target, propertyKey, paramIndex) => {
            const params = Reflect.getMetadata(symbolKey, target, propertyKey) || {};
            params[paramName] = paramIndex;
            Reflect.defineMetadata(symbolKey, params, target, propertyKey);
        };
    };
};
export const PathParam = genParam(pathParamSymbolKey);
export const QueryParam = genParam(queryParamSymbolKey);
export const BodyParam = genParam(bodyParamSymbolKey);
export const CtxParam = genParam(ctxParamSymbolKey);
export const NextParam = genParam(nextParamSymbolKey);
export const ReqParam = genParam(reqParamSymbolKey);
export const ResParam = genParam(resParamSymbolKey);
export const OriginParam = genParam(originParamSymbolKey);
//# sourceMappingURL=param.js.map