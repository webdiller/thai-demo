const EasyYandexS3 = require('easy-yandex-s3');

const yandexS3 = new EasyYandexS3({
  auth: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY,
  },
  Bucket: process.env.YANDEX_BUCKET_NAME,
  debug: true // Дебаг в консоли, потом можете удалить в релизе
});

export default yandexS3