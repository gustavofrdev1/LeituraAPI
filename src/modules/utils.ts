import path from "path";
import fs from "fs";
export const mimeDefaults: any = {
    R0lGODdh: "image/gif",
    R0lGODlh: "image/gif",
    iVBORw0KGgo: "image/png",
    "/9j/": "image/jpeg"
};

export const errors:any = {
    INVALID_DATA: {
        status: 400,
        description: "Um ou mais valores inseridos no body estão incorretos",
    },
    MISSING_API_ERROR: {
        status: 401,
        description: "Google Gemini API unreachable",
    },
    DOUBLE_REPORT: {
        status: 409,
        description: "Leitura do mês já realizada",
    },
    MEASURE_NOT_FOUND: {
        status: 404,
        description: "Leitura do mês não encontrada", // no documento está "Leitura do mês já realizada", acredito estar errado pois não faz 
                                                      // sentido para esta condição. Em caso de erro meu, desculpe :)
    },
    CONFIRMATION_DUPLICATE: {
        status: 409,
        description: "Leitura do mês já realizada",
    },
    INVALID_TYPE: {
        status: 400,
        description: "Tipo de medição não permitida",
    },
    MEASURES_NOT_FOUND: {
        status: 404,
        description: "Nenhuma leitura encontrada",
    },
};

export function thrownError(errorType: string, errorDesc: string, res: any) {
    const err = errors[errorType];
    if (err) {
        res.status(err.status).json({
            error_code: errorType,
            error_description: errorDesc || err.description,
        });
    } else {
        res.status(500).json({
            error_code: "UNKNOWN_ERROR",
            error_description: "An unexpected error occurred",
        });
    }
}


export function detectMimeType(base64: string) {
    for (const s in mimeDefaults) {
        if (base64.startsWith(s)) {
            return mimeDefaults[s];
        }
    }
}

export function isBase64Image(str: string) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str.replace(/\s/g, ''));
}

export function createTempImage(base64: string, imageType: string, uuid: string) {
    // aproveita o mime (image/png, image/jpeg) e remove o image/. Custa menos uma função
    imageType = imageType.replace("image/", "");
    const tempDir = path.join(__dirname, './modules_temp_files');
    // Caso a base64 tenha o holder data:/image(png/etc), irá remover. Deixa a aplicação mais funcional?
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imagePath = path.join(tempDir, uuid + "." + imageType);
    const imageName = uuid + "." + imageType
    fs.writeFileSync(imagePath, imageBuffer);
    return {tempDir, imagePath, imageName};
}

// Função que remove chaves numéricas e valores inválidos, retornando apenas as chaves restantes
export function cleanObject(obj: any): any {
    const newObj: any = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
  
        // Verifica se o valor é um objeto e se suas chaves são numéricas
        if (typeof value === 'object' && Object.keys(value).every(k => !isNaN(Number(k)))) {
          const cleanedValues = Object.values(value).map(cleanObject);
          newObj[key] = cleanedValues.filter(v => Object.keys(v).length > 0); 
        } else if (value !== null && value !== 0 && !Array.isArray(value)) {
          if (typeof value === 'object') {
            const cleanedValue = cleanObject(value);
            if (Object.keys(cleanedValue).length > 0) {
              newObj[key] = cleanedValue;
            }
          } else {
            newObj[key] = value;
          }
        }
      }
    }
  
    return newObj;

    // FUNÇÃO GERADA POR IA/GEMINI
  }
