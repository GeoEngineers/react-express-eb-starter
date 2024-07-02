import express from 'express';
const router = express.Router();

router.post("/", (req, res) => {
	console.log(req.body);
	res.send(
    	`I received your POST request. This is what you sent me: ${JSON.stringify(req.body)}`
	);
});

export default router;