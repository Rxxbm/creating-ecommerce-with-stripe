import "reflect-metadata";

function methodDecoratorFactory(method: string) {
  return function (path: string): MethodDecorator {
    return function (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      Reflect.defineMetadata("route", path, target, propertyKey);
      Reflect.defineMetadata("method", method, target, propertyKey);
    };
  };
}

export function Post(path: string): MethodDecorator {
  return methodDecoratorFactory("post")(path);
}

export function Get(path: string): MethodDecorator {
  return methodDecoratorFactory("get")(path);
}

export function Patch(path: string): MethodDecorator {
  return methodDecoratorFactory("patch")(path);
}

export function Put(path: string): MethodDecorator {
  return methodDecoratorFactory("put")(path);
}

export function Delete(path: string): MethodDecorator {
  return methodDecoratorFactory("delete")(path);
}
