import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
  Button,
  useMediaQuery,
} from "@mui/material";
import {
  Description as ContractIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  PictureAsPdf as PdfIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import supplierApi from "../../supplier/api/supplier.api";
import enterpriseApi from "../../enterprise/api/enterprise.api";
import quoteApi from "../../quote/api/quote.api";
import paymentApprovalApi from "../../payment/api/paymentApproval.api";
import ContractPDFView from "../components/ContractPDFView";
/**
 * ContractDetail - Trang chi tiết hợp đồng
 * @param {Object} contract - Dữ liệu hợp đồng từ API
 * @param {Function} onBack - Callback khi quay lại danh sách
 * @param {Function} onEdit - Callback khi click nút sửa (optional)
 */
const ContractDetail = ({ contract, onBack, onEdit }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [enterpriseInfo, setEnterpriseInfo] = useState(null);
  const [quoteInfo, setQuoteInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Fetch all info
  useEffect(() => {
    const fetchAllInfo = async () => {
      if (!contract) return;

      setLoadingInfo(true);
      setSupplierInfo(null);
      setEnterpriseInfo(null);
      setQuoteInfo(null);

      try {
        // Fetch supplier info
        if (contract?.supplierId) {
          try {
            const supplierResponse = await supplierApi.getSupplierById(contract.supplierId);
            let supplierData = supplierResponse?.data?.data || supplierResponse?.data || supplierResponse;
            
            if (supplierResponse?.data && typeof supplierResponse.data === 'object' && !supplierResponse.data.data) {
              supplierData = supplierResponse.data;
            }
            
            setSupplierInfo(supplierData);
            console.log("[CONTRACT_DETAIL] ✅ Supplier info fetched:", supplierData);
          } catch (error) {
            console.error("[CONTRACT_DETAIL] ❌ Error fetching supplier:", error);
          }
        }

        // Fetch enterprise info
        const enterpriseIdToFetch = contract?.enterpriseId || contract?.enterprise?.id;
        if (enterpriseIdToFetch) {
          try {
            const enterpriseResponse = await enterpriseApi.getEnterpriseById(enterpriseIdToFetch);
            let enterpriseData = enterpriseResponse?.data?.data || enterpriseResponse?.data || enterpriseResponse;
            
            if (enterpriseResponse?.data && typeof enterpriseResponse.data === 'object' && !enterpriseResponse.data.data) {
              enterpriseData = enterpriseResponse.data;
            }
            
            setEnterpriseInfo(enterpriseData);
            console.log("[CONTRACT_DETAIL] ✅ Enterprise info fetched:", enterpriseData);
          } catch (error) {
            console.error("[CONTRACT_DETAIL] ❌ Error fetching enterprise:", error);
          }
        }

        // Fetch quote info if contract has quoteId or paymentApprovalId
        let quoteIdToFetch = contract?.quoteId || contract?.quote?.id;
        
        // If no direct quoteId, try to get from paymentApproval
        if (!quoteIdToFetch && contract?.paymentApprovalId) {
          try {
            const projectId = contract?.projectId || contract?.project?.id;
            const paymentApprovalResponse = await paymentApprovalApi.getPaymentApprovalById(projectId, contract.paymentApprovalId);
            const paymentApprovalData = paymentApprovalResponse?.data || paymentApprovalResponse;
            quoteIdToFetch = paymentApprovalData?.quoteId;
            console.log("[CONTRACT_DETAIL] ✅ PaymentApproval info fetched, quoteId:", quoteIdToFetch);
          } catch (error) {
            console.error("[CONTRACT_DETAIL] ❌ Error fetching paymentApproval:", error);
          }
        }
        
        if (quoteIdToFetch) {
          try {
            const quoteResponse = await quoteApi.getQuoteById(quoteIdToFetch);
            let quoteData = quoteResponse?.data?.data || quoteResponse?.data || quoteResponse;
            
            if (quoteResponse?.data && typeof quoteResponse.data === 'object' && !quoteResponse.data.data) {
              quoteData = quoteResponse.data;
            }
            
            setQuoteInfo(quoteData);
            console.log("[CONTRACT_DETAIL] ✅ Quote info fetched:", quoteData);
          } catch (error) {
            console.error("[CONTRACT_DETAIL] ❌ Error fetching quote:", error);
          }
        }
      } catch (error) {
        console.error("[CONTRACT_DETAIL] Error fetching contract info:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchAllInfo();
  }, [contract]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleDownloadPDF = () => {
    const contractContent = document.getElementById('contract-pdf-content');
    
    if (!contractContent) {
      enqueueSnackbar("Không thể tải hợp đồng", { variant: "error" });
      return;
    }

    try {
      // Clone the contract content to preserve original
      const clonedContent = contractContent.cloneNode(true);
      
      // Remove zoom transform from cloned content
      clonedContent.style.transform = 'scale(1)';
      clonedContent.style.width = '100%';
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      // Get the contract HTML content
      const contractHTML = clonedContent.innerHTML;
      
      // Get all styles from the original document
      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(style => {
          if (style.tagName === 'STYLE') {
            return `<style>${style.innerHTML}</style>`;
          } else {
            return `<link rel="stylesheet" href="${style.href}">`;
          }
        })
        .join('');
      
      // Create the full HTML document with all styles
      const fullHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hợp đồng - ${contract?.name || 'Contract'}</title>
            ${styles}
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                * {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                font-family: "Times New Roman", serif;
                margin: 0;
                padding: 0;
                background: white;
                color: #000000;
              }
              * {
                box-sizing: border-box;
              }
            </style>
          </head>
          <body>
            ${contractHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(fullHTML);
      printWindow.document.close();
      
      enqueueSnackbar("Đang mở cửa sổ in. Vui lòng chọn 'Lưu dưới dạng PDF' trong dialog in.", { 
        variant: "info",
        autoHideDuration: 5000 
      });
    } catch (error) {
      console.error("[CONTRACT_DETAIL] Error generating PDF:", error);
      enqueueSnackbar("Lỗi khi tạo file PDF. Vui lòng thử lại.", { variant: "error" });
    }
  };

  if (!contract) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="text.secondary">Không có dữ liệu hợp đồng</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#e0e0e0',
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2.5,
        px: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onBack}
            sx={{
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <BackIcon />
          </IconButton>
          <ContractIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {contract.name || `Hợp đồng #${contract.id}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="Thu nhỏ">
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              }}
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography 
            variant="body2" 
            sx={{ 
              minWidth: 60, 
              textAlign: 'center', 
              fontWeight: 600,
              color: theme.palette.text.primary,
              px: 1,
            }}
          >
            {zoomLevel}%
          </Typography>
          <Tooltip title="Phóng to">
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                },
                '&.Mui-disabled': {
                  opacity: 0.3,
                },
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 1, sm: 2, md: 3 },
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: alpha(theme.palette.divider, 0.1),
          borderRadius: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: '5px',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.5),
          },
        },
      }}>
        {loadingInfo ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '600px',
            flex: 1,
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            id="contract-pdf-content"
            sx={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease',
              width: { xs: '100%', sm: '210mm' },
              maxWidth: '210mm',
              minHeight: '297mm',
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              margin: '0 auto',
              position: 'relative',
              my: { xs: 1, sm: 2 },
            }}
          >
            <ContractPDFView 
              contract={contract}
              supplier={supplierInfo}
              enterprise={enterpriseInfo || contract.enterprise}
              quote={quoteInfo}
            />
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 2.5,
        px: 3,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: '#ffffff',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
      }}>
        <Button 
          onClick={onBack}
          variant="outlined"
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            px: 3,
            borderColor: alpha(theme.palette.divider, 0.5),
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          Đóng
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          variant="contained"
          startIcon={<PdfIcon />}
          sx={{ 
            borderRadius: 2, 
            textTransform: 'none', 
            fontWeight: 600,
            px: 3,
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
              boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
            },
          }}
        >
          Tải PDF
        </Button>
      </Box>
    </Box>
  );
};

export default ContractDetail;
