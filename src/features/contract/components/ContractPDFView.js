import React from 'react';
import { Box, Typography, Divider, useTheme, alpha } from '@mui/material';

const ContractPDFView = ({ contract, supplier, enterprise, quote }) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value, currency = "VND") => {
    if (value === null || value === undefined || value === "") return "0";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return "0";
    return num.toLocaleString("vi-VN") + " " + currency;
  };

  const getStateLabel = (state) => {
    const labels = {
      DRAFT: "Bản nháp",
      SUBMITTED: "Đã gửi",
      SIGNED: "Đã ký",
      IN_PROGRESS: "Đang thực hiện",
      COMPLETED: "Hoàn thành",
      CANCELED: "Đã hủy",
    };
    return labels[state] || state;
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthNames = [
        "01", "02", "03", "04", "05", "06",
        "07", "08", "09", "10", "11", "12"
      ];
      return `ngày ${day} tháng ${monthNames[month - 1]} năm ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formatDateEnglish = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const daySuffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
      return `${month} ${day}${daySuffix} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '800px',
        backgroundColor: '#ffffff',
        padding: '60px',
        fontFamily: '"Times New Roman", serif',
        color: '#000000',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        },
      }}
    >
      {/* National Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="body1"
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            mb: 0.5,
            textTransform: 'uppercase',
          }}
        >
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          SOCIALIST REPUBLIC OF VIET NAM
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          Độc lập - Tự do - Hạnh phúc
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            mb: 2,
            fontStyle: 'italic',
          }}
        >
          Independence - Freedom - Happiness
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '12px',
            color: '#666',
            letterSpacing: '2px',
          }}
        >
          ---oOo---
        </Typography>
      </Box>

      {/* Contract Title */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '24px',
            mb: 1,
            color: '#000000',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          HỢP ĐỒNG DỊCH VỤ
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '18px',
            mb: 2,
            color: '#000000',
            textTransform: 'uppercase',
            fontStyle: 'italic',
          }}
        >
          SERVICE CONTRACT
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', mb: 1 }}>
          <strong>Số/No.:</strong> {contract?.contractNumber || contract?.id || "N/A"}
        </Typography>
      </Box>

      {/* Legal Basis */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify' }}>
          <strong>Căn cứ</strong> Bộ luật Dân sự số 33/2005/QH11 ngày 14/06/2005 của Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam;
          <br />
          <strong>Căn cứ</strong> Luật Thương mại số 36/2005/QH11 ngày 14/06/2005 của Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam;
          <br />
          <strong>Căn cứ</strong> Nhu cầu và khả năng của các bên;
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, mt: 2, textAlign: 'justify' }}>
          <strong>Hôm nay, {formatDateFull(contract?.startDate || contract?.createdAt)} (Date: {formatDateEnglish(contract?.startDate || contract?.createdAt)}), chúng tôi gồm có (Both Parties):</strong>
        </Typography>
      </Box>

      {/* Parties */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontSize: '15px', fontWeight: 700, mb: 1.5 }}>
            BÊN CUNG CẤP (SELLER) - Part A: {supplier?.name || contract?.supplier?.name || contract?.supplierName || "NHÀ CUNG CẤP"}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', pl: 2, lineHeight: 1.8 }}>
            <strong>Người đại diện/Representative:</strong> {supplier?.representative || supplier?.contactPerson || contract?.supplier?.representative || contract?.supplier?.contactPerson || "N/A"}
            <br />
            <strong>Điện thoại/Phone:</strong> {supplier?.phone || contract?.supplier?.phone || "N/A"}
            {(supplier?.fax || contract?.supplier?.fax) && (
              <>
                <br />
                <strong>Fax:</strong> {supplier?.fax || contract?.supplier?.fax}
              </>
            )}
            <br />
            <strong>Email:</strong> {supplier?.email || contract?.supplier?.email || "N/A"}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body1" sx={{ fontSize: '15px', fontWeight: 700, mb: 1.5 }}>
            BÊN SỬ DỤNG (BUYER) - (Bên B/Party B): {enterprise?.name || contract?.enterprise?.name || "DOANH NGHIỆP"}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', pl: 2, lineHeight: 1.8 }}>
            <strong>Người đại diện/Representative:</strong> {enterprise?.representative || enterprise?.contactPerson || contract?.enterprise?.representative || contract?.enterprise?.contactPerson || "N/A"}
            <br />
            <strong>Điện thoại/Phone:</strong> {enterprise?.phone || contract?.enterprise?.phone || "N/A"}
            {(enterprise?.fax || contract?.enterprise?.fax) && (
              <>
                <br />
                <strong>Fax:</strong> {enterprise?.fax || contract?.enterprise?.fax}
              </>
            )}
            <br />
            <strong>Email:</strong> {enterprise?.email || contract?.enterprise?.email || "N/A"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderWidth: 1, borderColor: '#ddd' }} />

      {/* Contract Terms */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Điều 1/Article 1: Nội dung hợp đồng (The contract contents)
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify' }}>
          Bên A thực hiện cung cấp dịch vụ {contract?.name || "theo nội dung hợp đồng"} cho bên B như sau/ Party A supply to Party B {contract?.name || "service"} follows:
          <br />
          {contract?.description || contract?.notes || "Các dịch vụ/sản phẩm được thỏa thuận giữa hai bên theo nội dung hợp đồng này."}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Điều 2/Article 2: Giá trị hợp đồng (Contract value)
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify' }}>
          Tổng giá trị hợp đồng/Total contract value: <strong>{formatCurrency(contract?.totalValue, contract?.currency)}</strong>
          <br />
          Bằng chữ/In words: {contract?.totalValueInWords || "N/A"}
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Điều 3/Article 3: Thời hạn hợp đồng (Contract term)
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify' }}>
          Thời hạn hợp đồng từ ngày {formatDateFull(contract?.startDate)} đến ngày {formatDateFull(contract?.endDate)}.
          <br />
          Contract term from {formatDateEnglish(contract?.startDate)} to {formatDateEnglish(contract?.endDate)}.
        </Typography>
      </Box>

      {(quote?.paymentTerms || contract?.paymentTerms) && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 700,
              mb: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Điều 4/Article 4: Điều khoản thanh toán (Payment terms)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {quote?.paymentTerms || contract?.paymentTerms}
          </Typography>
        </Box>
      )}

      {(quote?.guarantee || contract?.guaranteeTerms) && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 700,
              mb: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Điều 5/Article 5: Điều khoản bảo hành (Warranty terms)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {quote?.guarantee || contract?.guaranteeTerms}
          </Typography>
        </Box>
      )}

      {contract?.terminationTerms && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 700,
              mb: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Điều 6/Article 6: Điều khoản chấm dứt hợp đồng (Termination terms)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify', whiteSpace: 'pre-line' }}>
            {contract.terminationTerms}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 700,
            mb: 1.5,
            textTransform: 'uppercase',
          }}
        >
          Điều 7/Article 7: Trách nhiệm và quyền lợi (Rights and obligations)
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.8, textAlign: 'justify' }}>
          Các bên có trách nhiệm thực hiện đúng các điều khoản đã thỏa thuận trong hợp đồng này. 
          Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng, hòa giải hoặc theo quy định của pháp luật.
          <br />
          Both parties are responsible for properly implementing the terms agreed in this contract. 
          Any disputes arising will be resolved through negotiation, mediation or in accordance with the law.
        </Typography>
      </Box>

      <Divider sx={{ my: 4, borderWidth: 1, borderColor: '#ddd' }} />

      {/* Signatures */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="body1" sx={{ fontSize: '15px', fontWeight: 700, mb: 4 }}>
            BÊN A (BÊN CUNG CẤP)
            <br />
            PARTY A (SELLER)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', mt: 4 }}>
            (Ký và ghi rõ họ tên)
            <br />
            (Signature and full name)
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="body1" sx={{ fontSize: '15px', fontWeight: 700, mb: 4 }}>
            BÊN B (BÊN SỬ DỤNG)
            <br />
            PARTY B (BUYER)
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '14px', mt: 4 }}>
            (Ký và ghi rõ họ tên)
            <br />
            (Signature and full name)
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ fontSize: '12px', color: '#666' }}>
          Hợp đồng này có hiệu lực từ ngày ký và được lập thành {contract?.copies || 2} bản, mỗi bên giữ {contract?.copies ? Math.ceil(contract.copies / 2) : 1} bản có giá trị pháp lý như nhau.
        </Typography>
      </Box>
    </Box>
  );
};

export default ContractPDFView;

