import { RouteParameters } from "..";
import { dapi } from "../dapi";

function getSupportedParamTypes() {
  return ["string", "number", "date", "array", "boolean"];
}

function isSupportedParamType(type: string) {
  return getSupportedParamTypes().indexOf(type) !== -1;
}

export function parse(
  req: Request,
  routeParametersScheme: RouteParameters
) {
  if (
    dapi.utils.type.isUndef(routeParametersScheme)
    || !dapi.utils.type.isObject(routeParametersScheme)
    || dapi.utils.object.keys(routeParametersScheme).length === 0
  ) {
    return {};
  }

  const bodyParams = tools.read_object(req.Body);
  const clientParameters = dapi.utils.object.extend(
    req.Query,
    (IsArray(bodyParams) ? {} : bodyParams) as Object[]
  );

  const clientParametersKeys = dapi.utils.object.keys(clientParameters);

  const parsedParameters: RouteParameters = {};

  let clientParameterKey;

  for (clientParameterKey in clientParametersKeys) {
    parsedParameters.SetProperty(clientParameterKey, clientParameters[clientParameterKey]);
  }

  const routeParametersSchemeKeys = dapi.utils.object.keys(routeParametersScheme);

  let i = 0;
  let propertyKey;
  let propertySchema;
  let type;
  let value;
  let isConvert;
  let isOptional;
  let isNullable;
  let minValue;
  let maxValue;
  let childParamType;
  let stringLength;

  for (i = 0; i < routeParametersSchemeKeys.length; i++) {
    propertyKey = routeParametersSchemeKeys[i];
    propertySchema = routeParametersScheme[propertyKey];

    type = propertySchema.GetOptProperty("type");

    if (!isSupportedParamType(type)) {
      throw new Error(`Некорректно определен тип параметра ${propertyKey} - "${type}"\nДоступные параметры: ${getSupportedParamTypes().join(", ")}`);
    }

    isConvert = tools_web.is_true(propertySchema.GetOptProperty("convert"));
    isOptional = tools_web.is_true(propertySchema.GetOptProperty("optional"));
    isNullable = tools_web.is_true(propertySchema.GetOptProperty("nullable"));
    minValue = OptInt(propertySchema.GetOptProperty("min"));
    maxValue = OptInt(propertySchema.GetOptProperty("max"));

    if (!clientParameters.HasProperty(propertyKey) && !isOptional) {
      throw new Error(`Параметр ${propertyKey} должен быть определен`);
    }

    value = clientParameters.GetOptProperty(
      propertyKey,
      propertySchema.GetOptProperty("defaultValue", null)
    );

    if (value === null && (!isNullable && !isOptional)) {
      throw new Error(`Параметр ${propertyKey} не может быть null`);
    }

    if (type == "number") {
      if (isConvert) {
        value = tools_web.is_true(propertySchema.GetOptProperty("real"))
          ? OptReal(value, null)
          : OptInt(value, null);
      }
    } else if (type == "date" && isConvert) {
      value = OptDate(value);
    } else if (type == "boolean" && isConvert) {
      value = tools_web.is_true(value);
    } else if (type == "string") {
      if (!IsEmptyValue(value)) {
        value = Trim(tools_web.convert_xss(String(value)));
      }
    } else if (type == "array") {
      childParamType = propertySchema.GetOptProperty("items", "string");

      if (!isSupportedParamType(childParamType)) {
        throw new Error(`Некорректно определен тип дочерних элементов массива ${propertyKey} - ${childParamType}\nДоступные параметры: ${getSupportedParamTypes().join(", ")}`);
      }

      if (IsArray(value)) {
        value = dapi.utils.type.makeArraySafe(value, childParamType);
      }
    }

    if (!isOptional && !isNullable) {
      if (
        type == "string" && !dapi.utils.type.isString(value)
        || type == "number" && !dapi.utils.type.isNumber(value)
        || type == "boolean" && !dapi.utils.type.isBoolean(value)
        || type == "array" && !IsArray(value)
      ) {
        throw new Error(`Принимаемый параметр ${propertyKey} должен иметь тип ${type}`);
      }
    }

    if (type == "string" && dapi.utils.type.isString(value)) {
      stringLength = StrCharCount(value);

      if (minValue !== undefined && stringLength < minValue) {
        throw new Error(`Параметр ${propertyKey} должен быть минимум длины ${minValue}`);
      }

      if (maxValue !== undefined && stringLength > maxValue) {
        throw new Error(`Параметр ${propertyKey} должен быть минимум длины ${maxValue}`);
      }
    } else if (dapi.utils.type.isNumber(value)) {
      if (minValue !== undefined && value < minValue) {
        throw new Error(`Параметр ${propertyKey} должен быть больше ${minValue}`);
      }

      if (maxValue !== undefined && value > maxValue) {
        throw new Error(`Параметр ${propertyKey} должен быть меньше ${maxValue}`);
      }
    }

    parsedParameters[propertyKey] = value;
  }

  return parsedParameters;
}
