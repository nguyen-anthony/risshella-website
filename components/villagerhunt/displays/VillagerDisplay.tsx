"use client";
import * as React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import Image from "next/image";
import type { Villager } from "@/types/villagerhunt";

type DisplayVariant = "avatar" | "image" | "minimal";

type Props = {
  villager: Villager;
  variant?: DisplayVariant;
  showName?: boolean;
  avatarSize?: number;
  imageWidth?: number;
  imageHeight?: number;
};

export default function VillagerDisplay({
  villager,
  variant = "avatar",
  showName = true,
  avatarSize = 24,
  imageWidth = 60,
  imageHeight = 60,
}: Props) {
  if (variant === "minimal") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Avatar
          src={villager.image_url ?? undefined}
          alt={villager.name}
          sx={{ width: 16, height: 16 }}
        />
        {showName && (
          <Typography variant="caption">{villager.name}</Typography>
        )}
      </Box>
    );
  }

  if (variant === "image") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ position: "relative", width: imageWidth, height: imageHeight }}>
          <Image
            src={villager.image_url || "/placeholder.png"}
            alt={villager.name}
            width={imageWidth}
            height={imageHeight}
            style={{ objectFit: "contain", borderRadius: 4 }}
            unoptimized
          />
        </Box>
        {showName && (
          <Typography variant="body2" color="text.secondary">
            {villager.name}
          </Typography>
        )}
      </Box>
    );
  }

  // Default: avatar variant
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar
        src={villager.image_url ?? undefined}
        alt={villager.name}
        sx={{ width: avatarSize, height: avatarSize }}
      />
      {showName && (
        <Typography variant="body2">{villager.name}</Typography>
      )}
    </Box>
  );
}
