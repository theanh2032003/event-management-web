import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  styled,
  alpha,
  Chip,
  Grid,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";

const StyledCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha(
    theme.palette.primary.light,
    0.08
  )}, ${theme.palette.background.paper})`,
  borderRadius: 24,
  padding: theme.spacing(3.5),
  boxShadow:
    "0 18px 45px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.35)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow:
      "0 30px 55px rgba(15, 23, 42, 0.13), inset 0 1px 0 rgba(255,255,255,0.45)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  marginBottom: theme.spacing(2.5),
  color: theme.palette.text.primary,
}));

const SupplierAvatar = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "40%",
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: theme.spacing(0.25),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: "0.95rem",
  fontWeight: 500,
  color: theme.palette.text.primary,
  wordBreak: "break-word",
}));

const ContactCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  minHeight: 90,
}));

const InfoIcon = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 42,
  height: 42,
  borderRadius: "14px",
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

const StatsPill = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.2, 1.5),
  borderRadius: 14,
  backgroundColor: alpha(theme.palette.success.main, 0.08),
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  minWidth: 120,
}));

export default function SupplierInfoCard({ supplierInfo, loading }) {
  return (
    <StyledCard>
      <SectionTitle>Thông tin nhà cung cấp</SectionTitle>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Đang tải thông tin nhà cung cấp...
          </Typography>
        </Box>
      ) : supplierInfo ? (
        <>
          {/* Supplier Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2.5,
              mb: 3,
            }}
          >
            <SupplierAvatar>
              {supplierInfo.name?.charAt(0)?.toUpperCase() || "S"}
            </SupplierAvatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "1.35rem" },
                  mb: 0.5,
                }}
              >
                {supplierInfo.name || "Không xác định"}
              </Typography>
              <Chip
                size="small"
                label="Đối tác được xác minh"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <StatsPill>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Trạng thái
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                Sẵn sàng báo giá
              </Typography>
            </StatsPill>
          </Box>

          <Divider
            sx={(theme) => ({
              borderStyle: "dashed",
              borderColor: alpha(theme.palette.primary.main, 0.2),
              mb: 3,
            })}
          />

          {/* Supplier Details */}
          <Grid container spacing={2.5}>
            {supplierInfo.email && (
              <Grid item xs={12} sm={6}>
                <ContactCard>
                  <InfoIcon>
                    <EmailIcon fontSize="small" />
                  </InfoIcon>
                  <Box>
                    <InfoLabel>Email liên hệ</InfoLabel>
                    <InfoValue sx={{ color: "primary.main" }}>
                      {supplierInfo.email}
                    </InfoValue>
                  </Box>
                </ContactCard>
              </Grid>
            )}

            {supplierInfo.phone && (
              <Grid item xs={12} sm={6}>
                <ContactCard>
                  <InfoIcon>
                    <PhoneIcon fontSize="small" />
                  </InfoIcon>
                  <Box>
                    <InfoLabel>Số điện thoại</InfoLabel>
                    <InfoValue sx={{ color: "primary.main" }}>
                      {supplierInfo.phone}
                    </InfoValue>
                  </Box>
                </ContactCard>
              </Grid>
            )}

            {supplierInfo.address && (
              <Grid item xs={12}>
                <ContactCard>
                  <InfoIcon>
                    <LocationIcon fontSize="small" />
                  </InfoIcon>
                  <Box>
                    <InfoLabel>Địa chỉ</InfoLabel>
                    <InfoValue>{supplierInfo.address}</InfoValue>
                  </Box>
                </ContactCard>
              </Grid>
            )}
          </Grid>

          {!supplierInfo.email &&
            !supplierInfo.phone &&
            !supplierInfo.address && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic", mt: 2 }}
              >
                Chưa có thông tin liên hệ chi tiết
              </Typography>
            )}
        </>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontStyle: "italic",
            py: 2,
          }}
        >
          Không có thông tin nhà cung cấp
        </Typography>
      )}
    </StyledCard>
  );
}
