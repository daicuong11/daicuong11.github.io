# LDCPortfolio

Portfolio frontend được xây dựng bằng React + TypeScript + Vite.

## Scripts

- `npm run dev`: chạy local development.
- `npm run lint`: kiểm tra lint.
- `npm run build`: build production ra thư mục `dist`.
- `npm run preview`: preview bản build.

## CI/CD

Workflow: `.github/workflows/deploy-pages.yml`

- Trigger khi push lên nhánh `main` hoặc chạy thủ công.
- Chạy `npm ci` -> `npm run lint` -> `npm run build`.
- Upload artifact `dist` và deploy qua GitHub Pages.

## Deploy GitHub Pages + Custom Domain

- Domain đang dùng: `lydaicuong.me`.
- File `public/CNAME` được commit để luôn có mặt trong artifact deploy.
- Trong GitHub repository:
  - Vào **Settings -> Pages**
  - Source chọn **GitHub Actions**
  - Đảm bảo DNS của domain trỏ đúng về GitHub Pages.
