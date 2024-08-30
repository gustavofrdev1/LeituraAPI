import { queryDatabase_getty } from "../database/sqlite_utils";
import * as dev from "./../utils"

export async function confirm(req: any, res: any) {
    res.setHeader("Content-Type", "application/json");
    const { measure_uuid, confirmed_value } = req.body;
    console.log(req.body)
    if (!measure_uuid || isNaN(parseInt(confirmed_value))) {
      return dev.thrownError("INVALID_DATA", "", res);
    }
    try {
      const existingUuid = await queryDatabase_getty('SELECT * FROM leituras WHERE uuid = ?',[measure_uuid]);
      console.log(JSON.stringify(existingUuid))
      if (!existingUuid || existingUuid.has_confirmed === 1) {
        return dev.thrownError(existingUuid ? "CONFIRMATION_DUPLICATE" : "MEASURE_NOT_FOUND","",res);
      }
      await queryDatabase_getty("UPDATE leituras SET has_confirmed = 1, measure_value = ? WHERE uuid = ?",[parseInt(confirmed_value), measure_uuid]);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Error updating readers:\n", measure_uuid, "\n", err);
    }
  }
