const yandexS3Response = (location: string, key: string) => {
  return {
    ETag: "md5sum",
    VersionId: "null",
    Location: location,
    key: key,
    Key: key,
    Bucket: "actid-storage",
  };
};

export { yandexS3Response };
