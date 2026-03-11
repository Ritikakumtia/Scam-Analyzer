// src/components/HistoryList.jsx
import { Paper, Typography, Stack, Chip } from "@mui/material";

const HistoryList = ({ history, dark, prettyLabel }) => {
  if (!history.length) return null;

  const getColor = (rawLabel) => {
    const l = (rawLabel || "").toLowerCase();
    if (l === "scam") return "error";
    if (l === "not_scam" || l === "ham") return "success";
    return "warning";
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        bgcolor: dark ? "#020617" : "white",
        borderRadius: 3,
        color: dark ? "#e5e7eb" : "#0f172a",
      }}
    >
      {/* Section title */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: dark ? "#e5e7eb" : "#0f172a" }}
      >
        Recent analyses
      </Typography>

      <Stack spacing={2}>
        {history.map((item, idx) => (
          <div key={idx}>
            {/* Message preview */}
            <Typography
              variant="body2"
              sx={{
                color: dark ? "#cbd5f5" : "text.secondary",
                mb: 0.5,
              }}
            >
              {item.message.slice(0, 120)}
              {item.message.length > 120 && "..."}
            </Typography>

            {/* Label + score chip */}
            <Chip
              size="small"
              label={`${prettyLabel(item.result.label)} • ${item.result.score}/100`}
              color={getColor(item.result.label)}
            />
          </div>
        ))}
      </Stack>
    </Paper>
  );
};

export default HistoryList;
