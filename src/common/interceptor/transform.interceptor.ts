import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators"
import { BackendRes } from "../types/common.type";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, BackendRes<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<BackendRes<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    return next.handle().pipe(
      map(data => {

        let customMessage: string = 'Success';
        let payloadData: any = data;

        if (typeof data === 'string') {
          customMessage = data;
          payloadData = undefined;
        }

        return {
          statusCode: response.statusCode || HttpStatus.OK,
          message: customMessage,
          data: payloadData,
        };
      }),
    );
  }
}