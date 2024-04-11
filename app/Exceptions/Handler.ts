/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from "@ioc:Adonis/Core/Logger";
import HttpExceptionHandler from "@ioc:Adonis/Core/HttpExceptionHandler";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ApiError from "./ApiError";

interface ErrorResponse {
  success: boolean;
  error: string;
  [x: string]: any;
}

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger);
  }

  private getErrorResponses = new Map<
    string,
    (error?: any) => [number, ErrorResponse]
  >()
    .set("E_UNAUTHORIZED_ACCESS", () => [
      401,
      { success: false, error: "Usuário não autenticado" },
    ])
    .set("E_VALIDATION_FAILURE", (error) => [
      422,
      {
        success: false,
        error: error.messages.errors[0].message,
        ...error.messages,
      },
    ])
    .set("E_ROUTE_NOT_FOUND", () => [
      404,
      { success: false, error: "Rota não encontrada" },
    ])
    .set("E_ROW_NOT_FOUND", () => [
      404,
      { success: false, error: "Registro não encontrado" },
    ])
    .set("ER_NO_REFERENCED_ROW_2", () =>
      this.getErrorResponses.get("E_ROW_NOT_FOUND")!()
    )
    .set("ER_DUP_ENTRY", () => [
      409,
      { success: false, error: "Registro duplicado" },
    ]);

  private defaultHandler = (error: any) => {
    console.log("Erro desconhecido:", error);
    return [500, { success: false, error: "Erro desconhecido" }];
  };

  public async handle(error: any, ctx: HttpContextContract) {
    if (error instanceof ApiError) {
      return ctx.response.status(error.code).send({
        success: false,
        error: error.message,
      });
    } else {
      const handler =
        this.getErrorResponses.get(error.code) || this.defaultHandler;
      const [httpCode, errorResponse] = handler(error);
      return ctx.response.status(httpCode).send(errorResponse);
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    // return super.handle(error, ctx)
  }
}
