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

<table>
<thead>
  <tr>
    <th colspan="2">Endpoint</th>
    <th>Request type</th>
    <th>Body/Params</th>
    <th>Response</th>
    <th>Route</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td rowspan="2">User</td>
    <td>Signup</td>
    <td>POST</td>
    <td>Body: { username, email, password }</td>
    <td>{ token, user }</td>
    <td>/api/user/signup</td>
  </tr>
  <tr>
    <td>Login</td>
    <td>Post</td>
    <td>Body: { username, password }</td>
    <td>{ token, user }</td>
    <td>/api/user/login</td>
  </tr>
  <tr>
    <td rowspan="4">Employee</td>
    <td>Add</td>
    <td>POST</td>
    <td>Body: { name, dept, gender, salary, date_of_birth: <br> {year, month, day} }</td>
    <td>{ employee }</td>
    <td>/api/employee/add</td>
  </tr>
  <tr>
    <td>GetAll</td>
    <td>GET</td>
    <td>Query: { skip, take, orderby, searchString }</td>
    <td>[ employees ]</td>
    <td>/api/employee/all?skip=skip&amp;<br>take=take&amp;orderby=orderby&amp;<br>searchString=searchString</td>
  </tr>
  <tr>
    <td>Update</td>
    <td>PUT</td>
    <td>Param: { id }<br><br>Body: { name, dept, gender, salary, date_of_birth: <br> {year, month, day} }</td>
    <td>{}</td>
    <td>/api/employee/update/:id</td>
  </tr>
  <tr>
    <td>Delete</td>
    <td>DELETE</td>
    <td>Param: { id }</td>
    <td>{}</td>
    <td>/api/employee/delete/:id</td>
  </tr>
</tbody>
</table>

## License

Nest is [MIT licensed](LICENSE).
