import express from "express";
import viteExpress from "vite-express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls

// It is recommended to split different endpoints into different files,
// for example routes/formRoute.js would contain all code for this endpoint
// This helps prevent the main file from getting too large
// See http://expressjs.com/ for more info

app.post("/api/form", (req, res) => {
	console.log(req.body);
	res.send(
    	`I received your POST request. This is what you sent me: ${JSON.stringify(req.body)}`
	);
});

app.get("/api/restExample1", (req, res) => {
	res.send(
		[
			{
				"id": "1",
				"name": "John Doe",
				"age": 25,
				"email": "jdoe@test.com"
			},
			{
				"id": "2",
				"name": "Jane Doe",
				"age": 30,
				"email": "jdoe2@test.com"
			},
			{
				"id": "3",
				"name": "John Smith",
				"age": 35,
				"email": "jsmith@test.com"
			}
		]
	);

})

viteExpress.listen(app, 3000, () =>
	console.log("Server is listening on port 3000...")
);
