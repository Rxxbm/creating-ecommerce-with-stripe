import { Response } from "express";

export class RouteResponse {
  private static setResponse(data: any, status: boolean): object {
    return {
      status,
      date: new Date().toISOString(),
      data: status ? data : undefined,
      error: status ? undefined : data,
    };
  }

  public static success(res: Response, data: any): void {
    res.status(200).send(RouteResponse.setResponse(data, true));
  }

  public static successCreated(res: Response, data?: any): void {
    res.status(201).send(RouteResponse.setResponse(data, true));
  }

  public static successEmpty(res: Response): void {
    res.status(204).send();
  }

  public static badRequest(res: Response, error: string | any): void {
    res.status(400).send(RouteResponse.setResponse(error, false));
  }

  public static unauthorized(
    res: Response,
    message: string = "Unauthorized"
  ): void {
    res.status(401).send(RouteResponse.setResponse(message, false));
  }

  public static forbidden(message: string, res: Response): void {
    res.status(403).send(RouteResponse.setResponse(message, false));
  }

  public static notFound(res: Response, message: string): void {
    res.status(404).send(RouteResponse.setResponse(message, false));
  }

  public static conflictError(error: string | any, res: Response): void {
    res.status(409).send(RouteResponse.setResponse(error, false));
  }

  public static serverError(error: string | any, res: Response): void {
    res.status(500).send(RouteResponse.setResponse(error, false));
  }
}
