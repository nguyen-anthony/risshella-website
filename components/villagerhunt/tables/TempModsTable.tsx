"use client";
import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type TempMod = {
  temp_mod_twitch_id: number;
  temp_mod_username: string;
  expiry_timestamp: string;
};

type Props = {
  creatorTwitchId: number;
};

export default function TempModsTable({ creatorTwitchId }: Props) {
  const [tempMods, setTempMods] = React.useState<TempMod[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [changes, setChanges] = React.useState<{[key: number]: {expiry?: string, delete?: boolean}}>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchTempMods = async () => {
      try {
        const response = await fetch(`/api/temp-mods?creatorTwitchId=${creatorTwitchId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch temp mods");
        }
        const data = await response.json();
        setTempMods(data.tempMods || []);
      } catch (error) {
        console.error("Error fetching temp mods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTempMods();
  }, [creatorTwitchId]);

  const handleExpiryChange = (tempModTwitchId: number, newExpiry: string) => {
    setChanges(prev => ({
      ...prev,
      [tempModTwitchId]: {
        ...prev[tempModTwitchId],
        expiry: newExpiry
      }
    }));
  };

  const handleDeleteToggle = (tempModTwitchId: number, shouldDelete: boolean) => {
    setChanges(prev => ({
      ...prev,
      [tempModTwitchId]: {
        ...prev[tempModTwitchId],
        delete: shouldDelete
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [];
      const deletions = [];

      for (const [tempModTwitchId, change] of Object.entries(changes)) {
        if (change.delete) {
          deletions.push(parseInt(tempModTwitchId));
        } else if (change.expiry) {
          updates.push({
            tempModTwitchId: parseInt(tempModTwitchId),
            expiryTimestamp: change.expiry
          });
        }
      }

      // Process updates
      for (const update of updates) {
        await fetch("/api/temp-mods", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tempModTwitchId: update.tempModTwitchId,
            expiryTimestamp: update.expiryTimestamp,
            creatorTwitchId
          }),
        });
      }

      // Process deletions
      for (const tempModTwitchId of deletions) {
        await fetch(`/api/temp-mods?tempModTwitchId=${tempModTwitchId}&creatorTwitchId=${creatorTwitchId}`, {
          method: "DELETE",
        });
      }

      // Refresh the table
      const response = await fetch(`/api/temp-mods?creatorTwitchId=${creatorTwitchId}`);
      const data = await response.json();
      setTempMods(data.tempMods || []);
      setChanges({});

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return <Typography>Loading temp mods...</Typography>;
  }

  if (tempMods.length === 0) {
    return <Typography>No temporary moderators found.</Typography>;
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tempMods.map((mod) => {
              const change = changes[mod.temp_mod_twitch_id] || {};
              const currentExpiry = change.expiry || mod.expiry_timestamp;
              
              return (
                <TableRow key={mod.temp_mod_twitch_id}>
                  <TableCell>{mod.temp_mod_username}</TableCell>
                  <TableCell>
                    <TextField
                      type="datetime-local"
                      size="small"
                      value={(() => {
                        const date = new Date(currentExpiry + (currentExpiry.includes("Z") ? "" : "Z"));
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(2, "0");
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })()}
                      onChange={(e) => {
                        // The input value is in local time, convert to UTC for storage
                        const localDate = new Date(e.target.value);
                        handleExpiryChange(mod.temp_mod_twitch_id, localDate.toISOString());
                      }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={change.delete || false}
                      onChange={(e) => handleDeleteToggle(mod.temp_mod_twitch_id, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {hasChanges && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
