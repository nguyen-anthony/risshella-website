"use client";
import * as React from "react";
import { Box, Stack, TextField, InputAdornment, Pagination } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CreatorsGrid from "@/components/villagerhunt/CreatorsGrid";
import type { Creator } from "@/types/creator";

type Props = {
  creators: Creator[];
  moderatedUsernames?: string[];
  activeHunts: { hunt_id: string; hunt_name: string; twitch_id: number; current_island?: number }[];
  liveStreamUserIds: string[];
};

const CREATORS_PER_PAGE = 30;

export default function CreatorsSearchGrid({ creators, moderatedUsernames = [], activeHunts, liveStreamUserIds }: Props) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const normalized = (s: string) => s.toLowerCase().trim();
  const filtered = React.useMemo(() => {
    const q = normalized(query);
    if (!q) return creators;
    return creators.filter((c) => normalized(c.display_name || c.twitch_username).includes(q));
  }, [creators, query]);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.ceil(filtered.length / CREATORS_PER_PAGE);
  const startIndex = (page - 1) * CREATORS_PER_PAGE;
  const paginatedCreators = filtered.slice(startIndex, startIndex + CREATORS_PER_PAGE);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box>
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
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
        
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ 
              '& .MuiPagination-ul': { 
                flexWrap: 'nowrap' 
              } 
            }}
          />
        )}
      </Stack>

      <CreatorsGrid creators={paginatedCreators} emptyMessage={query ? "No matches found." : "No creators found."} moderatedUsernames={moderatedUsernames} activeHunts={activeHunts} liveStreamUserIds={liveStreamUserIds} />
    </Box>
  );
}
