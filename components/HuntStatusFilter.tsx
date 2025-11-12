'use client';

import * as React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HuntStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Filter by Status</InputLabel>
      <Select
        value={currentStatus}
        onChange={handleChange}
        label="Filter by Status"
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="ABANDONED">Abandoned</MenuItem>
        <MenuItem value="COMPLETED">Completed</MenuItem>
        <MenuItem value="PAUSED">Paused</MenuItem>
      </Select>
    </FormControl>
  );
}