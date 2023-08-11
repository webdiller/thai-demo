import prisma from "../libs/prisma";
import { Prisma } from "@prisma/client";
import { GetByQueryRequest, YandexUploadResponse } from "../../../types";
import {
  ArhivateOneProps,
  CreateOneProps,
  UpdateOneProps,
  UploadImageProps,
} from "../../../types/order";
import sharp from "sharp";
import { ApiError } from "../../../exceptions/apiError";
import yandexS3 from "../../../libs/yandex-s3/yandexs3";
import { DeleteImageFromOrderRequest } from "../../../types/seller";
class OrderService {
  async getByQuery({
    includeSubcategories,
    includeSellerProfile,
    whereCategoriesAndSubcategories,
    whereCities,
    page,
    take,
    orderBy,
  }: GetByQueryRequest) {
    const orderValidation = Prisma.validator<Prisma.OrderInclude>()({
      subcategory: includeSubcategories
        ? {
            include: {
              orderCategory: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  _count: {
                    select: {
                      order: true,
                    },
                  },
                },
              },
            },
          }
        : false,
      sellerProfile: includeSellerProfile,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              order: true,
            },
          },
        },
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          serialNumber: "asc",
        },
        select: {
          images: {
            select: {
              rootImageId: true,
              groupId: true,
              yandexLocation: true,
              type: true,
              format: true,
              rootImage: {
                select: {
                  serialNumber: true,
                },
              },
            },
          },
        },
      },
    });

    let orderByInput: Prisma.OrderOrderByWithRelationInput = {};

    if (!orderBy) {
      orderByInput.updatedAt = "desc";
    } else {
      const orderByKey = orderBy?.split("_")[0];
      const orderByValue: "asc" | "desc" = orderBy?.split("_")[1] as
        | "asc"
        | "desc";
      delete orderByInput.updatedAt;
      if (orderByKey.includes("updatedAt"))
        orderByInput.updatedAt = orderByValue;
      if (orderByKey.includes("createdAt"))
        orderByInput.createdAt = orderByValue;
      if (orderByKey.includes("price")) orderByInput.price = orderByValue;
    }

    const where: Prisma.OrderWhereInput = {
      OR: whereCategoriesAndSubcategories.map((category) => {
        let prepareQuery: any = {
          OR: {
            category: {
              slug: {
                equals: category.category,
              },
            },
          },
        };

        if (category.subcategories.length > 0) {
          prepareQuery.subcategory = {
            AND: {
              orderCategory: {
                slug: { equals: category.category },
              },
              slug: {
                in: category.subcategories,
              },
            },
          };
        }

        return prepareQuery;
      }),

      city: {
        slug: {
          in: whereCities,
        },
      },
    };

    if (whereCities.length === 0) delete where.city;

    if (
      whereCategoriesAndSubcategories === undefined ||
      whereCategoriesAndSubcategories.length === 0
    ) {
      delete where.OR;
    }

    const [count, orders] = await prisma.$transaction([
      prisma.order.count({
        where,
        orderBy: orderByInput,
      }),
      prisma.order.findMany({
        include: orderValidation,
        where: where,
        take,
        skip: take * (page - 1),
        orderBy: orderByInput,
      }),
    ]);

    const meta = {
      page,
      total: count,
      pageSize: take,
      pageCount: Math.ceil(count / take),
    };

    return { meta, orders };
  }

  async getAll() {
    const orders = await prisma.order.findMany({
      include: {
        subcategory: true
          ? {
              include: {
                orderCategory: true,
              },
            }
          : false,
        sellerProfile: true,
      },
    });
    return orders;
  }

  /**
   * 1. Массив объекта с:
   * Слагом категории
   * Количеством страниц
   */
  async getPaths() {
    interface PathProp {
      params: {
        categorySlug: string;
      };
    }

    const paths: PathProp[] = [];

    const allCategories = await prisma.orderCategory.findMany({
      select: {
        slug: true,
        _count: {
          select: {
            order: true,
          },
        },
      },
    });

    allCategories.map((category) => {
      const meta = {
        pageCount: Math.ceil(category._count.order / 20),
        categorySlug: category.slug,
      };

      paths.push({
        params: {
          categorySlug: category.slug,
        },
      });

      if (meta.pageCount > 0) {
        for (let indx = 1; indx <= meta.pageCount; indx++) {
          const preparePath: PathProp = {
            params: {
              categorySlug: `${category.slug}?page=${indx}`,
            },
          };
          paths.push(preparePath);
        }
      }
    });

    return paths;
  }

  async getByNumber(number: number) {
    const order = await prisma.order.findUnique({
      where: {
        number,
      },
      include: {
        subcategory: {
          include: {
            orderCategory: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        sellerProfile: {
          include: {
            profile: {
              include: {
                user: {},
              },
            },
          },
        },
        comments: {},
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        contact: true,
        images: {
          orderBy: {
            serialNumber: "asc",
          },
          select: {
            images: {
              select: {
                rootImageId: true,
                groupId: true,
                yandexLocation: true,
                type: true,
                format: true,
                rootImage: {
                  select: {
                    serialNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return order;
  }

  async createOne({
    title,
    content,
    cityId,
    price,
    categoryId,
    subcategoryId,
    sellerProfileId,
    contact,
  }: CreateOneProps) {
    const createdOrder = await prisma.order.create({
      data: {
        title,
        city: {
          connect: {
            id: cityId,
          },
        },
        content,
        price,
        category: {
          connect: {
            id: categoryId,
          },
        },
        subcategory: {
          connect: {
            id: subcategoryId,
          },
        },
        status: "START",
        sellerProfile: {
          connect: {
            id: sellerProfileId,
          },
        },
        contact: {
          create: {
            phone: contact.phone,
            whatsapp: contact.whatsapp,
            email: contact.email,
            telegram: contact.telegram,
          },
        },
      },
      select: {
        number: true,
        category: {
          select: {
            slug: true,
          },
        },
        subcategory: {
          select: {
            slug: true,
          },
        },
      },
    });
    return createdOrder;
  }

  async updateOne({
    orderNumber,
    title,
    content,
    price,
    cityId,
    sellerProfileId,
    contact,
  }: UpdateOneProps) {
    const updatedOrded = await prisma.order.update({
      where: {
        number: orderNumber,
      },
      data: {
        content,
        price,
        title,
        contact: {
          update: {
            phone: contact.phone,
            whatsapp: contact.whatsapp,
            email: contact.email,
            telegram: contact.telegram,
          },
        },
        city: {
          connect: {
            id: cityId,
          },
        },
        sellerProfile: {
          connect: {
            id: sellerProfileId,
          },
        },
      },
      select: {
        number: true,
        category: {
          select: {
            slug: true,
          },
        },
        subcategory: {
          select: {
            slug: true,
          },
        },
      },
    });
    return updatedOrded;
  }

  async arhivateOne({
    orderNumber,
    isArhivated,
    sellerProfileId,
  }: ArhivateOneProps) {
    const updatedOrder = await prisma.order.update({
      where: { number: orderNumber },
      data: {
        isArhivated: isArhivated,
        sellerProfile: {
          connect: {
            id: sellerProfileId,
          },
        },
      },
      select: {
        number: true,
        isArhivated: true,
      },
    });
    return updatedOrder;
  }

  async uploadImage({
    orderNumber,
    image,
    userId,
    groupId,
    serialNumber,
    isUploaded,
  }: UploadImageProps) {
    console.log("isUploaded: ", isUploaded);
    console.log("serialNumber: ", serialNumber);
    console.log("groupId: ", groupId);

    if (isUploaded === "true") {
      const matchRootImage = await prisma.rootImage.findFirst({
        where: {
          images: {
            every: {
              groupId: {
                equals: groupId,
              },
            },
          },
        },
      });

      if (matchRootImage) {
        const updMatchRootImage = await prisma.rootImage.update({
          where: {
            id: matchRootImage.id,
          },
          data: {
            serialNumber: {
              set: parseInt(serialNumber),
            },
          },
        });
        return {
          rootImageId: updMatchRootImage.id,
          uploaded: true,
          updated: true,
        };
      } else {
        throw ApiError.BadRequest("Не удалось обновить изображение");
      }
    } else {
      {
        const GROUP_ID = groupId;

        let originalWebpName = `${GROUP_ID}_original.webp`;
        let originalJpegName = `${GROUP_ID}_original.jpg`;

        let thumbWebpName = `${GROUP_ID}_thumb.webp`;
        let thumbJpegName = `${GROUP_ID}_thumb.jpg`;

        let smallWebpName = `${GROUP_ID}_small.webp`;
        let smallJpegName = `${GROUP_ID}_small.jpg`;

        try {
          const [
            originalJpegSharp,
            originalWebpSharp,

            thumbJpegSharp,
            thumbWebpSharp,

            smallJpegSharp,
            smallWebpSharp,
          ] = await Promise.all([
            await sharp(image.data)
              .jpeg({ quality: 80 })
              .toBuffer({ resolveWithObject: true }),
            await sharp(image.data)
              .webp({ quality: 80 })
              .toBuffer({ resolveWithObject: true }),

            await sharp(image.data)
              .resize({ width: 500, fit: "contain" })
              .jpeg({ quality: 80 })
              .toBuffer({ resolveWithObject: true }),
            await sharp(image.data)
              .resize({ width: 500, fit: "contain" })
              .webp({ quality: 80 })
              .toBuffer({ resolveWithObject: true }),

            await sharp(image.data)
              .resize({ width: 100, fit: "contain" })
              .jpeg({ quality: 50 })
              .toBuffer({ resolveWithObject: true }),
            await sharp(image.data)
              .resize({ width: 100, fit: "contain" })
              .webp({ quality: 50 })
              .toBuffer({ resolveWithObject: true }),
          ]);

          const [
            originalJpegYandex,
            originalWebpYandex,

            thumbJpegYandex,
            thumbWebpYandex,

            smallJpegYandex,
            smallWebpYandex,
          ] = await Promise.all([
            await yandexS3.Upload(
              { buffer: originalWebpSharp.data, name: originalWebpName },
              "/orders/"
            ),
            await yandexS3.Upload(
              { buffer: originalJpegSharp.data, name: originalJpegName },
              "/orders/"
            ),

            await yandexS3.Upload(
              { buffer: thumbWebpSharp.data, name: thumbWebpName },
              "/orders/"
            ),
            await yandexS3.Upload(
              { buffer: thumbJpegSharp.data, name: thumbJpegName },
              "/orders/"
            ),

            await yandexS3.Upload(
              { buffer: smallWebpSharp.data, name: smallWebpName },
              "/orders/"
            ),
            await yandexS3.Upload(
              { buffer: smallJpegSharp.data, name: smallJpegName },
              "/orders/"
            ),
          ]);

          interface ImageProps {
            sharp: {
              data: Buffer;
              info: sharp.OutputInfo;
            };
            yandexS3: YandexUploadResponse;
            type: "ORIGINAL" | "THUMBNAIL" | "SMALL";
          }

          const preparedImages: ImageProps[] = [
            {
              sharp: {
                data: originalJpegSharp.data,
                info: originalJpegSharp.info,
              },
              yandexS3: originalJpegYandex,
              type: "ORIGINAL",
            },
            {
              sharp: {
                data: originalWebpSharp.data,
                info: originalWebpSharp.info,
              },
              yandexS3: originalWebpYandex,
              type: "ORIGINAL",
            },

            {
              sharp: {
                data: thumbJpegSharp.data,
                info: thumbJpegSharp.info,
              },
              yandexS3: thumbJpegYandex,
              type: "THUMBNAIL",
            },
            {
              sharp: {
                data: thumbWebpSharp.data,
                info: thumbWebpSharp.info,
              },
              yandexS3: thumbWebpYandex,
              type: "THUMBNAIL",
            },

            {
              sharp: {
                data: smallJpegSharp.data,
                info: smallJpegSharp.info,
              },
              yandexS3: smallJpegYandex,
              type: "SMALL",
            },
            {
              sharp: {
                data: smallWebpSharp.data,
                info: smallWebpSharp.info,
              },
              yandexS3: smallWebpYandex,
              type: "SMALL",
            },
          ];

          if (
            originalJpegYandex &&
            originalWebpYandex &&
            thumbJpegYandex &&
            thumbWebpYandex &&
            smallJpegYandex &&
            smallWebpYandex
          ) {
            try {
              const rootImageId = await prisma.order.update({
                where: { number: parseInt(`${orderNumber}`) },
                data: {
                  images: {
                    create: {
                      serialNumber: parseInt(`${serialNumber}`),
                      images: {
                        createMany: {
                          data: preparedImages.map((image) => ({
                            groupId: GROUP_ID,
                            width: image.sharp.info.width,
                            height: image.sharp.info.height,
                            format: image.sharp.info.format,
                            type: image.type,
                            yandexBucket: image.yandexS3.Bucket,
                            yandexETag: image.yandexS3.ETag,
                            yandexKey: image.yandexS3.Key,
                            yandexkey: image.yandexS3.key,
                            yandexLocation: image.yandexS3.Location,
                          })),
                        },
                      },
                    },
                  },
                },
                select: {
                  images: {
                    where: {
                      images: {
                        every: {
                          groupId: {
                            equals: groupId,
                          },
                        },
                      },
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              });

              return {
                rootImageId: rootImageId.images[0].id,
                uploaded: true,
                updated: false,
              };
            } catch (error) {
              console.log(error);
              return { uploaded: false, groupId: GROUP_ID };
            }
          } else {
            throw ApiError.BadRequest("Не удалось загрузить изображение");
          }
        } catch (error) {
          throw ApiError.BadRequest("Не удалось загрузить изображение");
        }
      }
    }
  }

  async deleteImage({
    groupId,
    sellerProfileId,
    orderNumber,
    rootImageId,
  }: DeleteImageFromOrderRequest) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: {
        id: sellerProfileId,
      },
    });

    if (!sellerProfile) {
      throw new ApiError(403, "Нет прав на редактирование");
    }

    const rootImages = await prisma.rootImage.findMany({
      where: {
        images: {
          every: {
            groupId: {
              contains: groupId,
            },
          },
        },
      },
      select: {
        images: {
          select: {
            id: true,
            groupId: true,
            yandexkey: true,
          },
        },
      },
    });

    if (rootImages.length === 0)
      throw new ApiError(400, "Изображения не найдены");

    const [deletedImagesFromYandex] = await Promise.all(
      rootImages[0].images.map((image) => yandexS3.Remove(image.yandexkey))
    );

    const deleteImages = await prisma.rootImage.delete({
      where: {
        id: rootImageId,
      },
    });

    console.log("deleteImages: ", deleteImages);

    return { deleted: true, groupId: rootImages[0].images[0].groupId };
  }
}

export default new OrderService();
