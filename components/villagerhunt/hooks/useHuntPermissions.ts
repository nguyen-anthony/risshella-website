"use client";
import { useMemo } from "react";
import type { Session } from "@/types/villagerhunt";

export interface HuntPermissions {
  isOwner: boolean;
  isModerator: boolean;
  isTempMod: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageSettings: boolean;
}

export function useHuntPermissions(
  session: Session | null,
  username: string,
  isModerator: boolean,
  isTempMod: boolean
): HuntPermissions {
  return useMemo(() => {
    const isOwner = !!session && session.login.toLowerCase() === username.toLowerCase();
    const canEdit = isOwner || isModerator || isTempMod;
    const canDelete = isOwner;
    const canManageSettings = isOwner;

    return {
      isOwner,
      isModerator,
      isTempMod,
      canEdit,
      canDelete,
      canManageSettings,
    };
  }, [session, username, isModerator, isTempMod]);
}
