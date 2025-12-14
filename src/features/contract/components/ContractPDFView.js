import React from 'react';
import { Box, Typography, Divider, useTheme } from '@mui/material';

const ContractPDFView = ({ contract, supplier, enterprise, quote }) => {
  const theme = useTheme();

  const formatDateFull = (dateString) => {
    if (!dateString) return "……";
    const date = new Date(dateString);
    return `ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
  };

  const formatCurrency = (value, currency = "VND") => {
    if (!value) return "0 " + currency;
    return Number(value).toLocaleString("vi-VN") + " " + currency;
  };

  const numberToVietnameseWords = (number) => {
  if (number === null || number === undefined) return "";

  const units = [
    "không", "một", "hai", "ba", "bốn",
    "năm", "sáu", "bảy", "tám", "chín"
  ];

  const readThreeDigits = (num) => {
    let hundred = Math.floor(num / 100);
    let ten = Math.floor((num % 100) / 10);
    let unit = num % 10;
    let result = "";

    if (hundred > 0) {
      result += units[hundred] + " trăm";
      if (ten === 0 && unit > 0) result += " lẻ";
    }

    if (ten > 1) {
      result += " " + units[ten] + " mươi";
      if (unit === 1) result += " mốt";
      else if (unit === 5) result += " lăm";
      else if (unit > 0) result += " " + units[unit];
    } else if (ten === 1) {
      result += " mười";
      if (unit === 5) result += " lăm";
      else if (unit > 0) result += " " + units[unit];
    } else if (ten === 0 && unit > 0 && hundred === 0) {
      result += units[unit];
    }

    return result.trim();
  };

  const scales = ["", " nghìn", " triệu", " tỷ"];
  let num = Math.floor(Number(number));
  if (num === 0) return "Không đồng";

  let words = "";
  let scaleIndex = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      words = readThreeDigits(chunk) + scales[scaleIndex] + " " + words;
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return words.trim().charAt(0).toUpperCase() + words.trim().slice(1) + " đồng";
};


  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '800px',
        backgroundColor: '#fff',
        padding: '60px',
        fontFamily: '"Times New Roman", serif',
        color: '#000',
      }}
    >
      {/* Quốc hiệu */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
          Độc lập – Tự do – Hạnh phúc
        </Typography>
        <Typography sx={{ fontSize: 12 }}>--------------------</Typography>
      </Box>

      {/* Tên hợp đồng */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
          HỢP ĐỒNG DỊCH VỤ
        </Typography>
        <Typography sx={{ fontSize: 14, mt: 1 }}>
          Số: {contract?.contractNumber || contract?.id || "……"}
        </Typography>
      </Box>

      {/* Căn cứ */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
          Căn cứ Bộ luật Dân sự năm 2015;
          <br />
          Căn cứ Luật Thương mại năm 2005;
          <br />
          Căn cứ nhu cầu và khả năng của các bên.
        </Typography>

        <Typography sx={{ fontSize: 14, mt: 2 }}>
          Hôm nay, {formatDateFull(contract?.startDate || contract?.createdAt)}, 
          tại ……., chúng tôi gồm có:
        </Typography>
      </Box>

      {/* Bên A */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
          BÊN A (BÊN CUNG CẤP DỊCH VỤ)
        </Typography>
        <Typography sx={{ fontSize: 14, pl: 2, lineHeight: 1.8 }}>
          Tên đơn vị: {supplier?.name || "……"}
          <br />
          Người đại diện: {supplier?.ownerName || "……"}
          <br />
          Điện thoại: {supplier?.phone || "……"}
          <br />
          Email: {supplier?.email || "……"}
        </Typography>
      </Box>

      {/* Bên B */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
          BÊN B (BÊN SỬ DỤNG DỊCH VỤ)
        </Typography>
        <Typography sx={{ fontSize: 14, pl: 2, lineHeight: 1.8 }}>
          Tên đơn vị: {enterprise?.name || "……"}
          <br />
          Người đại diện: {enterprise?.ownerName || "……"}
          <br />
          Điện thoại: {enterprise?.phone || "……"}
          <br />
          Email: {enterprise?.email || "……"}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Điều 1 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          Điều 1. Nội dung hợp đồng
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
          Bên A cung cấp cho Bên B dịch vụ: {contract?.name || "……"}.
          <br />
          Nội dung chi tiết: {contract?.description || contract?.notes || "Theo thỏa thuận giữa hai bên."}
        </Typography>
      </Box>

      {/* Điều 2 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          Điều 2. Giá trị hợp đồng
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
          Tổng giá trị hợp đồng: <strong>{formatCurrency(contract?.totalValue, contract?.currency)}</strong>
          <br />
          (Bằng chữ: {numberToVietnameseWords(contract?.totalValue) || "……"})
        </Typography>
      </Box>

      {/* Điều 3 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          Điều 3. Thời hạn thực hiện hợp đồng
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
          Thời hạn thực hiện hợp đồng từ {formatDateFull(contract?.startDate)} 
          đến {formatDateFull(contract?.endDate)}.
        </Typography>
      </Box>

      {/* Điều 4 */}
      {(quote?.paymentTerms || contract?.paymentTerms) && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Điều 4. Phương thức và điều kiện thanh toán
          </Typography>
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {quote?.paymentTerms || contract?.paymentTerms}
          </Typography>
        </Box>
      )}

      {/* Điều 5 */}
      {(quote?.guarantee || contract?.guaranteeTerms) && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Điều 5. Bảo hành và cam kết
          </Typography>
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {quote?.guarantee || contract?.guaranteeTerms}
          </Typography>
        </Box>
      )}

      {/* Điều 6 */}
      {contract?.terminationTerms && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            Điều 6. Chấm dứt hợp đồng
          </Typography>
          <Typography sx={{ fontSize: 14, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {contract.terminationTerms}
          </Typography>
        </Box>
      )}

      {/* Điều 7 */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
          Điều 7. Điều khoản chung
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
          Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong hợp đồng này.
          Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng, nếu không đạt được
          thỏa thuận thì đưa ra cơ quan có thẩm quyền theo quy định pháp luật.
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Ký tên */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>ĐẠI DIỆN BÊN A</Typography>
          <Typography sx={{ mt: 6 }}>(Ký, ghi rõ họ tên)</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>ĐẠI DIỆN BÊN B</Typography>
          <Typography sx={{ mt: 6 }}>(Ký, ghi rõ họ tên)</Typography>
        </Box>
      </Box>

      {/* Hiệu lực */}
      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd', textAlign: 'center' }}>
        <Typography sx={{ fontSize: 12 }}>
          Hợp đồng được lập thành {contract?.copies || 2} bản, có giá trị pháp lý như nhau,
          mỗi bên giữ {contract?.copies ? Math.ceil(contract.copies / 2) : 1} bản.
        </Typography>
      </Box>
    </Box>
  );
};

export default ContractPDFView;
