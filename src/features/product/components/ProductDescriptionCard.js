import React, { useMemo } from "react";
import { Box, Typography, styled, alpha, Chip, Divider } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

const StyledCard = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 24,
  padding: theme.spacing(4),
  background: `linear-gradient(140deg, ${alpha(
    theme.palette.primary.light,
    0.18
  )}, ${alpha(theme.palette.background.paper, 0.95)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow:
    "0 25px 50px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,0.35)",
  overflow: "hidden",
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.secondary, 0.9),
  letterSpacing: 1,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
}));

const HeaderIcon = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 20,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.25
  )}, ${alpha(theme.palette.primary.dark, 0.45)})`,
  color: theme.palette.common.white,
  boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.35)}`,
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  fontSize: "1rem",
  lineHeight: 1.85,
  color: alpha(theme.palette.text.primary, 0.9),
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
}));

const EmptyState = styled(Typography)(({ theme }) => ({
  fontSize: "0.95rem",
  color: alpha(theme.palette.text.secondary, 0.9),
  fontStyle: "italic",
}));

const DescriptionList = styled("ul")(({ theme }) => ({
  margin: theme.spacing(1.5, 0, 0),
  paddingLeft: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
  "& li": {
    color: alpha(theme.palette.text.secondary, 0.9),
    fontWeight: 600,
    listStyle: "disc",
  },
}));

const HighlightChip = styled(Chip)(({ theme }) => ({
  borderRadius: 999,
  fontSize: "0.75rem",
  fontWeight: 600,
  padding: theme.spacing(0.5, 0),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  borderColor: alpha(theme.palette.primary.main, 0.3),
}));

export default function ProductDescriptionCard({ description }) {
  const content = description?.trim();
  const featureLines = useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [content]);

  return (
    <StyledCard>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <SectionHeader>
          <HeaderIcon>
            <DescriptionIcon fontSize="medium" />
          </HeaderIcon>
          <Box>
            <SectionTitle>Mô tả sản phẩm</SectionTitle>
            <SectionSubtitle>Những điểm nổi bật</SectionSubtitle>
            <HighlightChip
              label="Tóm tắt dành cho khách hàng"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        </SectionHeader>

        <Divider
          sx={(theme) => ({
            borderStyle: "dashed",
            borderColor: alpha(theme.palette.primary.main, 0.3),
            my: 2,
          })}
        />

        {featureLines.length > 0 ? (
          featureLines.length > 1 ? (
            <DescriptionList>
              {featureLines.map((line, index) => (
                <li key={`${line}-${index}`}>
                  <DescriptionText component="span">{line}</DescriptionText>
                </li>
              ))}
            </DescriptionList>
          ) : (
            <DescriptionText>{featureLines[0]}</DescriptionText>
          )
        ) : (
          <EmptyState>Chưa có mô tả chi tiết cho sản phẩm này.</EmptyState>
        )}
      </Box>
    </StyledCard>
  );
}
