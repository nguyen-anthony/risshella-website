"use client";
import * as React from "react";
import { Box, Stack, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CreatorsGrid from "@/components/CreatorsGrid";
import type { Creator } from "@/types/creator";

type Props = {
  creators: Creator[];
  moderatedUsernames?: string[];
};

export default function CreatorsSearchGrid({ creators, moderatedUsernames = [] }: Props) {
  const [query, setQuery] = React.useState("");

  const normalized = (s: string) => s.toLowerCase().trim();
  const filtered = React.useMemo(() => {
    const q = normalized(query);
    if (!q) return creators;
    return creators.filter((c) => normalized(c.display_name || c.twitch_username).includes(q));
  }, [creators, query]);

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators"
          variant="outlined"
          size="small"
          sx={{ width: { xs: "100%", sm: 360 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            "aria-label": "Search creators",
          }}
        />
      </Stack>

      <CreatorsGrid creators={filtered} emptyMessage={query ? "No matches found." : "No creators found."} moderatedUsernames={moderatedUsernames} />
    </Box>
  );
}
