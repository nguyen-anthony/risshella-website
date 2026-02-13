"use client";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import type { Villager } from "@/types/villagerhunt";

type DisplayVariant = "avatar" | "image" | "minimal" | "card";

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
        <Box 
          sx={{ 
            position: "relative", 
            width: 16, 
            height: 16,
            flexShrink: 0,
          }}
        >
          <Image
            src={villager.image_url || "/placeholder.png"}
            alt={villager.name}
            width={16}
            height={16}
            style={{ objectFit: "contain" }}
            unoptimized
          />
        </Box>
        {showName && (
          <Typography variant="caption">{villager.name}</Typography>
        )}
      </Box>
    );
  }

  if (variant === "card") {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          gap: 0.5,
          minWidth: imageWidth,
        }}
      >
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
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ textAlign: "center", lineHeight: 1.2, maxWidth: imageWidth + 20 }}
          >
            {villager.name}
          </Typography>
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
      <Box 
        sx={{ 
          position: "relative", 
          width: avatarSize, 
          height: avatarSize,
          flexShrink: 0,
        }}
      >
        <Image
          src={villager.image_url || "/placeholder.png"}
          alt={villager.name}
          width={avatarSize}
          height={avatarSize}
          style={{ objectFit: "contain", borderRadius: 4 }}
          unoptimized
        />
      </Box>
      {showName && (
        <Typography variant="body2">{villager.name}</Typography>
      )}
    </Box>
  );
}
