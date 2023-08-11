import B2 from "backblaze-b2";
import { UploadedFile } from "express-fileupload";
import sharp from "sharp";
import { ApiError } from "../../exceptions/apiError";
import { B2UploadResponse } from "../../types";

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID!,
  applicationKey: process.env.BACKBLAZE_APP_NAME!,
});

class B2Client {
  async uploadFile(
    fileName: string,
    file: { data: Buffer; info: sharp.OutputInfo }
  ) {
    try {
      await b2.authorize();
      const buket = await b2.getUploadUrl({
        bucketId: process.env.BACKBLAZE_BUKET_ID!,
      });

      const fileInfo = await b2.uploadFile({
        uploadAuthToken: buket.data.authorizationToken,
        fileName: fileName,
        data: file.data,
        uploadUrl: buket.data.uploadUrl,
      });

      return fileInfo;
    } catch (err) {
      console.log(err);
      throw ApiError.BadRequest("Не удалось загрузить изображение");
    }
  }

}

export default new B2Client();
