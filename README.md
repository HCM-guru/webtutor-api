<h1 align="center">DAPI - инструмент для разработчиков WebSoft HCM</h1>

## Что это такое и зачем оно мне?

Данное программное решение предоставляет набор удобных инструментов для разработчиков WebSoft HCM, которое позволяет существенно сократить время на разработку и отладку программного кода: вам больше не нужно создавать отдельные документы в системе и копировать в них исходные коды, всё будет лежать в едином структурированном репозитории, поддержка hotreload позволит сразу же видеть внесенные изменения, а типизация избавит от опечаток и необходимости просмотра наличия тех или иных полей объектов или аргументов функций в исходных файлах системы.

#### Основные преимущества инструмента

- Гибкий оркестр запросов для реализации REST API
- Набор часто используемых утилит для работы с объектами и выборками
- Механизм hotreload
- Поддержка типизации
- Автоматизированная сборка проекта с возможностью настройки поставки

## Как начать с этим работать?

### Клонирование и установка зависимостей

Для начала работы необходимо иметь интернет соединение, установленный [Git](https://git-scm.com/) и [Node.js](https://nodejs.org/), если эти условия удовлетворены - выполняем клонирование данного репозитория к себе и устанавливаем [npm](https://www.npmjs.com/) зависимости, делается это с помощью нескольких простых команд в командной строке.

```bash
git clone https://github.com/umbrik/webtutor-api.git    # Клонирование репозитория
cd webtutor-api                                         # Переходим в директорию, куда был склонирован репозиторий 
npm i                                                   # Устанавливаем заивимости с помощью npm
```

### Работа с проектом в редакторе

Открываем директорию проекта в редакторе форматированного текста, например, [Visual Studio Code](https://code.visualstudio.com/) или любом другом, с поддержкой TypeScript.

#### Структура проекта

Ниже представлена структура проекта с кратким описанием его директорий.

```
webtutor-api/
├─ build/                   # Собранный проект
├─ gulp/                    # Задачи для таск-менеджера Gulp
│  ├─ plugins
├─ src/                     # В данной директории расположен основной код проекта
│  ├─ controllers/          # Доступные для вызова через API функции
│  ├─ services/             # Функции для выполнения запросов и действий, вызываются из контроллеров 
│  ├─ utils/                # Общие функции для упрощения разработки, например - приведение даты в определенный формат
```

Важно помнить, что в **программном коде библиотек можно объявлять только функции**, в противном случае - будет выведена ошибка из-за ограничений платформы.

Доступ к объявленным функциям можно получить с помощью глобальной переменной `dapi`, в ней хранятся ссылки на все функции из `services` и `utils`.
```typescript
dapi.utils.isDate(someDate);  // Обращение к функции `isDate`, расположенной в каталоге `utils`
dapi.services.getEvents();    // Обращение к функции `getEvents`, расположенной в каталоге `services`
```

Вы можете обращаться к переменной `dapi` из любого объекта системы на сервере, если же вам нужно реализовать поддержку в толстом клиенте администратора, необходимо будет точечно устанавливать данную библиотеку для каждого пользователя, что очень сильно не рекомендуется из-за сопутствующей сложности данного процесса.

#### controllers

Директория предназначена для размещения программного кода верхнеуровневых обработчиков пользовательских запросов - предлагается не размещать здесь бизнес-логику, а использовать как промежуточный слой для выполнения каких-то долнительных проверок, склеивания ответов разных функций и прочего.

Важно помнить, что функция будет доступна для вызова только если вы опишите её в специальной функции `functions()`, как показано на примере ниже.

```typescript
// Объявляем функцию `functions` и описываем какие endpoint будут доступны пользователю при обращении к ней
export function functions(): Route[] {
  return [{
    method: "GET",                  // HTTP метод
    pattern: "/collaborator",       // Адрес
    callback: "getCollaborator",    // Название вызываемой функции, расположенной в этом же файле
    access: "user"                  // Доступ к функции для пользователя или внешего приложения
  }];
}

// Объявляем функцию для вывода идентификатора текущего пользователя
export function getCollaborator(params: HandlerParams, Request: Request) {
  return dapi.utils.response.ok(`curUserID is ${Request.Session.Env.curUserID}`); // Возвращаем ответ, обернув в специальную функцию `ok`
}
```

В результате вышеописанных действий, пользователь сможет получить свой идентификатор, обратившись по адресу `https://your-server-address.ru/api/v1/collaborators/collaborator`, при этом - вам не нужно думать об аутентификации, так как этот процесс зашит в ядро оркестратора.

#### services

Директория для размещения программного кода для работы с конкретными объектами и выборками.

Фактически, является набором библиотек программного кода, функции которых размещаются в глобальной переменной `dapi.service`.

```typescript
// Пример реализации простого сервиса по выборке мероприятий 
export function getEvents() {
  return dapi.utils.query.extract<EventCatalogDocument>(`for $e in events return $e`);
}

// Данная функция будет доступна к вызову следующим образом
dapi.services.getEvents();
```

#### utils

Директория для размещения программного кода общего назначения, например - конвертация дат, приведением объектов к определённому формату и прочее.

Фактически, является набором библиотек программного кода, функции которых размещаются в глобальной переменной `dapi.utils`.

```typescript
// Пример реализации аналога `Array.pop()`
export function pop(array: unknown[]): unknown[] {
  return ArrayRange(array, 0, ArrayCount(array) - 1);
}

// Данная функция будет доступна к вызову следующим образом
dapi.utils.pop(["foo", "bar"]);
```

### Сборка проекта

Сборка проекта выполняется командой `npm run build`

Результат выполнения команды будет примерно следующим:

```bash
🔧 Файл ./webtutor-api/src/services/*.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/api.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/index.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/controllers/*.ts успешно транспилирован
🔧 Файл ./webtutor-api/src/utils/*.ts успешно транспилирован
```

После этого у вас должна появится новая директория [build](#Структура-проекта)

### Поставка на сервер

Контент директории `build` необходимо перенести на сервер в `x-local://wt/web/dapi`.

После того, как перенесли директорию, необходимо запустить файл установки библиотеки:

если у вас `powershell`/`pwsh`
> `install.ps1`

если у вас `bash`/`pwsh`

> `install.sh`


Результат выполнения:

```bash
DAPI node successfully added to api_ext.xml file
```

После этого перезагружаем сервер с `wt` и в логах `xhttp` будет следующий вывод:

```bash
Registering dapi
array was successfully loaded as part of utils, hash is F29DE32E5B053DD42E71C52E80595F32
object was successfully loaded as part of utils, hash is A7DB89C01498303C8254B8A1593A653E
validator was successfully loaded as part of utils, hash is 7F670B7683DC0E1BFBC30B001CA1361C
passport was successfully loaded as part of utils, hash is A43BC502E35D1C0BFEE49DF8212CA97C
router was successfully loaded as part of utils, hash is 2FC7B615F195CB129CB8A0124C1D7676
fs was successfully loaded as part of utils, hash is 9D69670F309EF9CC22E142064A9A3233
paginator was successfully loaded as part of utils, hash is 1A71AF815E2EAFF76A22CB72C231D2FD
response was successfully loaded as part of utils, hash is C895BF217B8E225E7C32FB000E58173A
config was successfully loaded as part of utils, hash is C38B8CF9B098377BE3B9DA4BFF06C3C3
query was successfully loaded as part of utils, hash is 97B9E15ACA5D7A9911E4F0CEEADB6E2E
log was successfully loaded as part of utils, hash is C0A85788A3832253EEEBE74D6A8950CE
request was successfully loaded as part of utils, hash is CF0AD736861E2CB51F8CAD2330E18607
type was successfully loaded as part of utils, hash is 45508C2BFC6C5B14B7D409B089356D0E
events was successfully loaded as part of services, hash is BC355042ED2BBDAA234AFEABED752DA1
Config loaded: {"env":"development","version":"9.9.9","api":{"pattern":"/api/v1","basepath":"x-local://wt/web/dapi"},"stderr":true}
Web rule successfully updated 7257866394331456688
API is ready: /api/v1
dapi successfully registered
External API Lib: x-local://wt/web/dapi/index.xml. Loaded.
```

Если все так, то теперь вы можете проверить доступ к API по адресу [localhost/api/v1/check](localhost/api/v1/check)

## Ограничения и условности

Так как в проекте изспользуется `TypeScript`, который будет транспилирован в `JavaScript` - необходимо использовать в разработке только приближенные к `SP-XML Script` конструкции, иначе вы получите невалидный для WebSoft HCM программный код.
