import { getServerSession } from "next-auth";
import { getUserRoles, UserRoles } from "./service";
import { AdminRallyRole, AdminTradingRole } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth";

export interface RoleCheckResult<T> {
  success: boolean;
  roles?: UserRoles;
  error?: string;
  allowedRole?: T;
}

export async function checkUserRole<T extends string | AdminTradingRole | AdminRallyRole>( allowedRoles: T[] ): Promise<RoleCheckResult<T>> {
  // Get the session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Not logged in" };
  }

  // Fetch user roles
  const roles = await getUserRoles(session.user.id);

  // Determine if the user has a matching role
  const userRole = roles.role;
  if (!userRole || !allowedRoles.includes(userRole as T)) {
    return { success: false, error: "Not allowed to perform this action", roles };
  }

  return { success: true, roles, allowedRole: userRole as T };
}
