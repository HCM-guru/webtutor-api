import { dapi } from "../dapi";

export function getDetails(eventId: number) {
  const eventDocument = tools.open_doc<EventDocument>(eventId);

  return {
    id: eventDocument.DocID,
    name: eventDocument.TopElem.name.Value,
    comment: eventDocument.TopElem.comment.Value,
    description: eventDocument.TopElem.desc.Value,
    resource_id: dapi.utils.url.getDownloadFileUrl(eventDocument.TopElem.resource_id.Value),
    start_date: eventDocument.TopElem.start_date.Value,
    finish_date: eventDocument.TopElem.finish_date.Value,
    max_person_num: eventDocument.TopElem.max_person_num.Value,
    person_num: eventDocument.TopElem.person_num()
  };
}

export function getEvents() {
  return dapi.utils.query.extract<EventCatalogDocument>("for $e in events return $e");
}
