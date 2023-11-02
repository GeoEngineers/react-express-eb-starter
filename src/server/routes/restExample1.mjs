import express from 'express';
const router = express.Router();
import { getData } from '../functions/exampleDataSource.mjs';

router.get('/', (req, res, next) => {
    
    // best practice is to separate logic like database queries into
    // different "function" files, this makes code more portable

    let data = getData();
    res.send(data);
});

export default router;