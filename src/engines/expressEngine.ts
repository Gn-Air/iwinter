import {Engine, engineSymbolKey} from './baseEngine';
import {scanDir} from '../fileUtil';
import {httpMethodSymbolKey} from '../decorators/http-method';
import {rootPathSymbolKey, pathSymbolKey, methodsSymbolKey} from '../decorators/path';

export default class ExpressEngine extends Engine {

    constructor(router: any, dir: string, prefix: string = ''){
        super();
        //如果没有传递路由，则报错
        if(!router){
            console.error('Please config router');
            return Object.create({});
        }
        this.router = router;
        this.dir = dir;
        this.prefix = prefix;
        Reflect.defineMetadata(engineSymbolKey, 'expressEngine', Engine.prototype);
    }

    controller(){
        // let files = scanDir(self.dir);
        // files.map(file=> {
        //     self.addRouterMap(require(file).default);
        // });
        super.controller();
        return this.router;
    }

    // addRouterMap(Controller: any){
    //     //读取根路径
    //     let self = this;
    //     let instance = new Controller();
    //     let prototype = Controller.prototype;
    //     let rootPath = Reflect.getMetadata(rootPathSymbolKey, prototype);
    //     let methods = Reflect.getMetadata(methodsSymbolKey, prototype);
    //     methods.map(methodName => {
    //         let method = instance[methodName];
    //         let httpMethod = Reflect.getMetadata(httpMethodSymbolKey, prototype, methodName);
    //         let path = Reflect.getMetadata(pathSymbolKey, prototype, methodName);
    //         self.router[httpMethod](`${self.prefix}${rootPath}${path}`, method);
    //     });
    // }
}