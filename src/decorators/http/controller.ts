import "reflect-metadata";

export function Controller(basePath: string) {
  return function (target: Function) {
    Reflect.defineMetadata("basePath", basePath, target);
  };
}
