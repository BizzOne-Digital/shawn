import type { Prisma } from "@prisma/client";

/**
 * MongoDB documents often omit optional fields instead of storing null.
 * Prisma's `deletedAt: null` only matches explicit nulls, not missing fields.
 */
export const NOT_DELETED: Prisma.BusinessWhereInput = {
  OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
};

export const USER_NOT_DELETED: Prisma.UserWhereInput = {
  OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
};
