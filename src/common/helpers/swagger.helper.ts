import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { ApiResponse } from "../entities/api.entity";

export const ApiOkResponseWithData = <TModel extends Type<any>>(
  model: TModel,
  isArray = false,
) => {
  return applyDecorators(
    ApiExtraModels(ApiResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: isArray
                ? {
                  type: "array",
                  items: { $ref: getSchemaPath(model) },
                }
                : {
                  $ref: getSchemaPath(model),
                },
            },
          },
        ],
      },
    }),
  );
};
