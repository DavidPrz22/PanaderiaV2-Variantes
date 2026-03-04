import type { User } from "@/features/Authentication/types/types";
import { PERMISSIONS } from "@/features/Authentication/lib/permissions";

export const userHasPermission = (user: User, entity: string, action: string) => {

    const permissions = PERMISSIONS[user.rol.toLocaleLowerCase() as keyof typeof PERMISSIONS];
    console.log(permissions)
    return permissions.includes(`${action}:${entity}`);
}