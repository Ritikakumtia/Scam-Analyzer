// src/App.jsx
import { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Stack,
} from "@mui/material";
import { DarkMode, LightMode, Refresh } from "@mui/icons-material";
import axios from "axios";
import RiskGauge from "./components/RiskGauge";
import HistoryList from "./components/HistoryList";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000"; // change for production

  const handleAnalyze = async () => {
    setError("");

    if (!message.trim()) {
      setError("Please paste a message to analyze.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/api/analyze`, { message });
      const data = res.data;

      // backend sends score 0–1 -> convert to 0–100
      const scorePercent = Math.round((data.score ?? 0) * 100);

      const normalized = {
        ...data,
        score: scorePercent,
      };

      setResult(normalized);
      setHistory((prev) => [
        { message, result: normalized, timestamp: new Date().toISOString() },
        ...prev.slice(0, 9),
      ]);
    } catch (e) {
      console.error(e);
      setError("Failed to analyze message. Is the backend running on :5000?");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setDark((d) => !d);

  const prettyLabel = (raw) => {
    if (!raw) return "";
    const l = raw.toLowerCase();
    if (l === "scam") return "Scam";
    if (l === "not_scam" || l === "ham") return "Likely Safe";
    return raw;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: dark ? "#0f172a" : "#f1f5f9",
        color: dark ? "#e5e7eb" : "#0f172a",
        transition: "0.3s",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" fontWeight="700">
            Scam Analyzer
          </Typography>
          <IconButton onClick={toggleTheme} color="inherit">
            {dark ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 3, maxWidth: 700 }}>
          Paste any email / SMS / WhatsApp message below. We’ll analyze it with
          a machine-learning model and show a risk score and explanation.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
            gap: 3,
          }}
        >
          {/* LEFT: input */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              bgcolor: dark ? "#020617" : "white",
              borderRadius: 3,
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Message text"
                multiline
                minRows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  style: { color: dark ? "#9ca3af" : undefined },
                }}
                InputProps={{
                  sx: { color: dark ? "#e5e7eb" : "#0f172a" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root fieldset": {
                    borderColor: dark ? "#475569" : "#cbd5e1",
                  },
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: dark ? "#64748b" : "#0f172a",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: dark ? "#38bdf8" : "#2563eb",
                  },
                }}
              />

              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  Analyze
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setMessage("");
                    setResult(null);
                    setError("");
                  }}
                >
                  Clear
                </Button>
              </Box>

              {loading && <LinearProgress />}
            </Stack>
          </Paper>

          {/* RIGHT: result */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              bgcolor: dark ? "#020617" : "white",
              borderRadius: 3,
              color: dark ? "#e5e7eb" : "#0f172a",
            }}
          >
            {result ? (
              <>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: dark ? "#e5e7eb" : "#0f172a" }}
                >
                  Risk assessment
                </Typography>

                <RiskGauge
                  score={result.score}
                  label={prettyLabel(result.label)}
                  dark={dark}
                />

                <Typography
                  variant="subtitle2"
                  sx={{
                    mt: 2,
                    mb: 1,
                    color: dark ? "#e5e7eb" : "#0f172a",
                  }}
                >
                  Why we think this:
                </Typography>

                <Stack direction="column" spacing={1}>
                  {Array.isArray(result.reasons) && result.reasons.length > 0 ? (
                    result.reasons.map((reason, idx) => (
                      <Chip
                        key={idx}
                        label={reason}
                        variant="outlined"
                        sx={{
                          borderColor: dark ? "#4b5563" : "#cbd5e1",
                          color: dark ? "#e5e7eb" : "#0f172a",
                        }}
                      />
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: dark ? "#9ca3af" : "text.secondary" }}
                    >
                      No explanation provided by the model.
                    </Typography>
                  )}
                </Stack>

                {result.probabilities && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      display: "block",
                      color: dark ? "#9ca3af" : "text.secondary",
                    }}
                  >
                    Probabilities – Scam:{" "}
                    {(result.probabilities.scam * 100).toFixed(1)}%, Safe:{" "}
                    {(
                      (result.probabilities.not_scam ??
                        result.probabilities.ham ??
                        0) * 100
                    ).toFixed(1)}
                    %
                  </Typography>
                )}
              </>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: dark ? "#9ca3af" : "text.secondary" }}
              >
                Results will appear here after you analyze a message.
              </Typography>
            )}
          </Paper>
        </Box>

        {/* History */}
        <Box sx={{ mt: 4 }}>
          <HistoryList history={history} dark={dark} prettyLabel={prettyLabel} />
        </Box>
      </Container>
    </Box>
  );
}

export default App;
