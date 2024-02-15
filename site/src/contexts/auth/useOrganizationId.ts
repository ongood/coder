import { useMe } from "./useMe";

export const useOrganizationId = (): string => {
  const me = useMe();

  if (me.organization_ids.length < 1) {
    throw new Error("用户不是任何组织的成员");
  }

  return me.organization_ids[0];
};
