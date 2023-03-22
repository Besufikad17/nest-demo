# NestDemo

## Description

A simple employee management API made by using [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Usage

- Swagger documentation is available under http://localhost:3000/api
- [Postman collection](https://github.com/Besufikad17/nest-demo/releases/download/%23testing/NestDemo.postman_collection.json)

### Endpoints

| Endpoint |        | Request type | Body/Params                                                                              | Response        | Route                                                                             |
|----------|--------|--------------|------------------------------------------------------------------------------------------|-----------------|-----------------------------------------------------------------------------------|
| User     | Signup | POST         | Body: { username, email, password }                                                      | { token, user } | /api/user/signup                                                                  |
|          | Login  | Post         | Body: { username, password }                                                             | { token, user } | /api/user/login                                                                   |
| Employee | Add    | POST         | Body: { name, dept, gender, salary, date_of_birth:   {year, month, day} }                | { employee }    | /api/employee/add                                                                 |
|          | GetAll | GET          | Query: { skip, take, orderby, searchString }                                             | [ employees ]   | /api/employee/all?skip=skip& take=take&orderby=orderby& searchString=searchString |
|          | Update | PUT          | Param: { id }  Body: { name, dept, gender, salary, date_of_birth:   {year, month, day} } | {}              | /api/employee/update/:id                                                          |
|          | Delete | DELETE       | Param: { id }                                                                            | {}              | /api/employee/delete/:id                                                          |

## License

Nest is [MIT licensed](LICENSE).
