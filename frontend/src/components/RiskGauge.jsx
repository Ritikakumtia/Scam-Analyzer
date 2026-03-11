// src/components/RiskGauge.jsx
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Box, Typography } from "@mui/material";

const RiskGauge = ({ score, label, dark }) => {
  const data = [{ name: "risk", value: score }];

  const color =
    score >= 60 ? "#ef4444" : score >= 30 ? "#f97316" : "#22c55e";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <RadialBarChart
        width={150}
        height={150}
        cx={75}
        cy={75}
        innerRadius={40}
        outerRadius={70}
        barSize={14}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          dataKey="value"
          fill={color}
          background
          clockWise
        />
      </RadialBarChart>

      <Box>
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{ color: dark ? "#e5e7eb" : "#0f172a" }}
        >
          {score}
          <Typography
            component="span"
            variant="subtitle1"
            sx={{ color: dark ? "#9ca3af" : "#475569", ml: 0.5 }}
          >
            /100
          </Typography>
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{ mt: 1, color: dark ? "#e5e7eb" : "#0f172a" }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default RiskGauge;
