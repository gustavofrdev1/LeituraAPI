import * as dotenv from "dotenv";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {GoogleAIFileManager} from "@google/generative-ai/server";
import {v4 as uuidv4} from 'uuid';
import fs from "fs";
import { queryDatabase_getty } from "../database/sqlite_utils";
import * as dev from "./../utils"
dotenv.config();

const geminiKey = process.env.GEMINI_API_KEY ?? "";
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
const fileManager = new GoogleAIFileManager(geminiKey);


export async function upload(req: any, res: any) {
    res.setHeader("Content-Type", "application/json");
    
    const {image, customer_code, measure_datetime, measure_type} = req.body;
    const requestUuid = uuidv4();
    if (!image || !customer_code || !measure_datetime || !measure_type ||(measure_type !== "WATER" && measure_type !== "GAS") || !dev.isBase64Image(image)) {

        return dev.thrownError("INVALID_DATA", "Dados da requisição inválidos. Verifique se todos os campos estão preenchidos corretamente, lembrando que a imagem deve estar no formato base64", res);
    }
    try {
        const existingCustomer = await queryDatabase_getty(
          'SELECT * FROM leituras WHERE customer_code = ?',
          [parseInt(customer_code)]
        );
      
        if (existingCustomer && existingCustomer.measure_type == measure_type) {
            // {
            //     "error_code": "DOUBLE_REPORT",
            //     "error_description": "Leitura do mês já
            //     realizada"
            //     }`
          dev.thrownError("DOUBLE_REPORT", "Leitura do mês já realizada", res)
          return;
        } 
      } catch (err) {
        console.error("Error checking customer:", err);
      }
    const mime = dev.detectMimeType(image);
    if (!mime) {
        return dev.thrownError("INVALID_DATA", "", res);
    }
    const imageCreated = dev.createTempImage(image, mime, requestUuid);

    try {
        const file = await fileManager.uploadFile(imageCreated.imagePath, {
            mimeType: mime,
            displayName: requestUuid,
        });

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: file.file.mimeType,
                    fileUri: file.file.uri
                }
            },
            {
                text: "Analise o visor da imagem que você recebeu e me diga qual é o resultado(apenas números inteiros, sem pontos ou virgulas). Não me passa qualquer outra informação, apenas os números do visor, tente ser o mais preciso(a) possível"
            }
        ]);
        res.status(200).json({"image_url": file.file.uri,"measure_value": result.response.text(),"measure_uuid": requestUuid
        });
        fs.unlinkSync(imageCreated.imagePath)
        try {
            await queryDatabase_getty(`INSERT INTO leituras (uuid, customer_code, measure_value, measure_type, has_confirmed, imageurl) VALUES (?, ?, ?, ?, ?, ?)`, [requestUuid, parseInt(customer_code), parseInt(result.response.text()), measure_type, 0, file.file.uri]);
            console.log("Data inserted successfully for "+requestUuid);
          } catch (err) {
            console.error("Error inserting data for"+requestUuid+":", err);
    
          }
    } catch (err) {
        console.error("API Error:", err);
        return dev.thrownError("MISSING_API_ERROR", "API do GemimiAI não está funcionando no momento :(", res);
    }
}