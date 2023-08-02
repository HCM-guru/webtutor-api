import { Route } from "..";
import { dapi } from "../dapi";

export function functions(): Route[] {
  return [{
    method: "GET",
    pattern: "/file",
    callback: "getFile",
    access: "user",
    summary: "Получение файла",
    params: {
      id: {
        type: "number"
      }
    }
  }];
}

export function getFile(req: Request, res: Response, params: Object) {
  const resourceDocument = tools.open_doc<ResourceDocument>(params.id);

  if (resourceDocument === undefined) {
    return dapi.utils.response.notFound(res, "Ресурс не найден");
  }

  const hasAccess = tools_web.check_access(
    resourceDocument.TopElem,
    req.Session.Env.curUserID,
    req.Session.Env.curUser,
    req.Session
  );

  if (!hasAccess) {
    return dapi.utils.response.forbidden(res, "Доступ к ресурсу запрещен");
  }

  return dapi.utils.response.binary(res, resourceDocument);
}
