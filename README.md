
# YG Health and social services Backend
Health and social services Backend for Vuejs-based web apps for internal services.  

## Development
Before starting the API server, you need to create the appropriate .env file, which can be done by running `cp src/api/.env src/api/.env.development`. You must then set the appropriate values.

Before starting the WEB server, you need to create the appropriate .env file which can be done by running `cp src/web/.env.sample src/web/.env.development`. You must then set the appropriate value.

To develop within this environment, you must have Node.js and NPM installed on your development machine. Open two terminal windows and open one to `/src/api` and `src/web`, respectively. The API back-end and the web front-end can be started with: `npm run start:dev`.


Once both are running, open your browser and navigate to http://localhost:8080 to view the application.

## Understanding the environment variables

Environment variables should never be checked into the repository! 

- API_PORT=(the port the API will be listening on (doesn't have to match the docker port))
- FRONTEND_URL=(the url of the service, from browser)
- AUTH_REDIRECT=(FRONTEND_URL from above)/login-complete
- BASE_URL=(the url of the service, from API)
- CLIENT_SECRET= (Client secret is generated from https://auth0.com/docs)
- CLIENT_ID= (Client id is generated from https://auth0.com/docs)
- ISSUER_BASE_URL= (Base url is generated from https://auth0.com/docs)
- SECRET= (Secret is generated from https://auth0.com/docs)
- DB_HOST=(the host address of the database.)
- DB_USER=(Specifies the name of the user to connect as database)
- DB_PASS=(Specifies the database password of the user to connect as database)
- DB_PORT=(Specifies the database port )