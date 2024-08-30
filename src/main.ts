import express, {Express} from "express";
import * as dotenv from "dotenv";
import * as uploader from "./modules/post/upload"
import * as confirm from "./modules/patch/confirm"
import * as getty from "./modules/get/get"
import bodyParser from "body-parser";
import multer from 'multer';
import { on } from "./modules/database/sqlite_utils"
const upload = multer();
const port = 8000
on()
dotenv.config()
const app: Express = express();
//app.use(cors());



app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));
app.post("/upload", upload.any(), uploader.upload)
app.patch("/confirm", confirm.confirm )
app.get("/:customer_code/list", getty.get)

if (port != null) {
    const listen = app.listen(port, "localhost", () => {
        console.log("API running at " + port);
    });
    
}

export {app}
