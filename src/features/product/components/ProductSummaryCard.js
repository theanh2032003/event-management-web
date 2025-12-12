import React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  styled,
  alpha,
  Divider,
  Stack,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const StyledCard = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.85)
      : "linear-gradient(145deg, #ffffff 0%, #f6f7fb 60%)",
  borderRadius: 32,
  padding: theme.spacing(4.5),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.07)}`,
  boxShadow:
    "0 35px 80px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
  backdropFilter: "blur(14px)",
  transition: "transform 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow:
      "0 45px 90px rgba(15, 23, 42, 0.15), inset 0 1px 0 rgba(255,255,255,0.45)",
  },
}));

const ProductCarousel = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  paddingBottom: '75%', // 4:3 aspect ratio
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  overflow: 'hidden',
  borderRadius: 12,
  '& img': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease',
  },
}));

const CarouselButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: alpha(theme.palette.common.white, 0.9),
  backdropFilter: 'blur(4px)',
  '&:hover': {
    backgroundColor: theme.palette.common.white,
  },
  zIndex: 5,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
}));

const ThumbnailContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: 6,
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.divider, 0.1),
    borderRadius: 3,
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 3,
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const Thumbnail = styled(Box)(({ theme, active }) => ({
  width: 70,
  height: 70,
  minWidth: 70,
  borderRadius: 8,
  cursor: 'pointer',
  overflow: 'hidden',
  border: `2px solid ${active ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
  opacity: active ? 1 : 0.6,
  transition: 'all 0.2s ease',
  '&:hover': {
    opacity: 1,
    borderColor: theme.palette.primary.main,
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const PriceTag = styled(Typography)(({ theme }) => ({
  fontSize: '2.4rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  letterSpacing: '-0.02em',
  display: 'flex',
  alignItems: 'baseline',
  gap: theme.spacing(0.5),
}));

const InfoRow = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: theme.spacing(0.5),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const StatBadge = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.25, 1.5),
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  background: alpha(theme.palette.primary.light, 0.08),
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
}));

const BadgeRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
}));

const PricePanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 20,
  background: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.75, 2),
  fontSize: "1rem",
  fontWeight: 700,
  borderRadius: 14,
  textTransform: "none",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: "0 15px 30px rgba(25, 118, 210, 0.35)",
  color: theme.palette.common.white,
  "&:hover": {
    boxShadow: "0 18px 40px rgba(25, 118, 210, 0.45)",
    color: theme.palette.common.white,
  },
}));

export default function ProductSummaryCard({ 
  product, 
  currentImageIndex, 
  setCurrentImageIndex,
  onRequestQuote 
}) {
  return (
    <StyledCard>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 3, md: 5 },
        }}
      >
        {/* Left: Product Images */}
        <Box>
          <ProductCarousel>
            <img 
              src={product.images[currentImageIndex]} 
              alt={`${product.name} ${currentImageIndex + 1}`} 
            />
            
            {/* Previous Button */}
            {product.images.length > 1 && (
              <CarouselButton
                sx={{ left: 12 }}
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === 0 ? product.images.length - 1 : prev - 1
                )}
              >
                <ChevronLeftIcon />
              </CarouselButton>
            )}
            
            {/* Next Button */}
            {product.images.length > 1 && (
              <CarouselButton
                sx={{ right: 12 }}
                onClick={() => setCurrentImageIndex((prev) => 
                  prev === product.images.length - 1 ? 0 : prev + 1
                )}
              >
                <ChevronRightIcon />
              </CarouselButton>
            )}
          </ProductCarousel>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <ThumbnailContainer>
              {product.images.map((img, idx) => (
                <Thumbnail
                  key={idx}
                  active={idx === currentImageIndex}
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </Thumbnail>
              ))}
            </ThumbnailContainer>
          )}
        </Box>

        {/* Right: Product Info */}
        <Stack spacing={3} sx={{ height: "100%" }}>
          {/* Product Name & Category */}
          <Box>
            <BadgeRow>
              {/* <Chip
                label={product.category}
                sx={(theme) => ({
                  borderRadius: "999px",
                  px: 1.5,
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                })}
                variant="outlined"
              /> */}
             
            </BadgeRow>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
              }}
            >
              {product.name}
            </Typography>
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: alpha(theme.palette.text.secondary, 0.9),
                mt: 0.5,
              })}
            >
              
            </Typography>
          </Box>

          {/* Price + Meta */}
          <PricePanel>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                letterSpacing: 1.2,
                color: "text.secondary",
                fontWeight: 700,
                mb: 1,
              }}
            >
              Giá tham khảo
            </Typography>
            <PriceTag>
              {product.price.toLocaleString("vi-VN")}
              <Typography component="span"  sx={{ fontSize: 20 }} >
                ₫ / {product.unit}
              </Typography>
            </PriceTag>
          
          </PricePanel>

          <Divider flexItem sx={{ borderStyle: "dashed", opacity: 0.5 }} />

          {/* Stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <StatBadge>
              <InfoLabel>Loại sản phẩm</InfoLabel>
              <InfoValue>{product.category}</InfoValue>
            </StatBadge>
            {/* <StatBadge>
              <InfoLabel>Đơn vị</InfoLabel>
              <InfoValue>{product.unit}</InfoValue>
            </StatBadge> */}
           
          </Box>

        

          {/* Quote Button */}
          <Box sx={{ mt: "auto" }}>
            <GradientButton fullWidth onClick={onRequestQuote}>
              Gửi yêu cầu báo giá
            </GradientButton>
           
          </Box>
        </Stack>
      </Box>
    </StyledCard>
  );
}
