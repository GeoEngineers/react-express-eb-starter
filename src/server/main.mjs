import express from "express";
import viteExpress from "vite-express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls

// It is recommended to split different endpoints into different files,
// for example routes/form.mjs would contain all code for this endpoint
// This helps prevent the main file from getting too large
// See http://expressjs.com/ for more info

import formRouter from './routes/form.mjs'
app.use('/api/form', formRouter)

import restExample1Router from './routes/restExample1.mjs'
app.use('/api/restExample1', restExample1Router)

viteExpress.listen(app, 3000, () =>
	console.log("Server is listening on port 3000...")
);
