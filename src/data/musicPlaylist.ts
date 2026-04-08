/**
 * Nhạc phát từ thư mục public (cùng origin) để Web Audio API + MediaElementSource hoạt động đúng.
 * Thêm file: public/music/01.mp3 … public/music/10.mp3 (hoặc chạy scripts/fetch-demo-music.sh).
 * Ảnh bìa tùy chọn: đặt file trong public/music_imgs và ghi tên file vào imageName (ví dụ "01.jpg").
 */
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  /** Giây — gợi ý UI; duration thật lấy từ metadata khi phát */
  duration: number;
  /** Đường dẫn tuyệt đối trên site, ví dụ /music/01.mp3 */
  url: string;
  /** Góc hue HSL cho placeholder bìa (0–360) khi không có imageName */
  coverHue: number;
  /** Tên file trong public/music_imgs (ví dụ cover.jpg); null = gradient + chữ cái như cũ */
  imageName: string | null;
}

/** URL ảnh bìa hoặc null nếu không cấu hình / không hợp lệ */
export function trackCoverSrc(track: MusicTrack): string | null {
  if (track.imageName == null) return null;
  const name = String(track.imageName).trim();
  if (!name) return null;
  if (name.includes('..') || name.includes('/') || name.includes('\\')) return null;
  return `/music_imgs/${encodeURIComponent(name)}`;
}

export const musicPlaylist: MusicTrack[] = [
  { id: '1', title: 'Anh đã quen với cô đơn', artist: 'Sobin Hoàng Sơn', duration: 480, url: '/music/01.mp3', coverHue: 210, imageName: '01.jpg' },
  { id: '2', title: 'Đường tôi chở em về', artist: 'buitruonglinh', duration: 360, url: '/music/02.mp3', coverHue: 280, imageName: '02.jpg' },
  { id: '3', title: 'Cưới thôi', artist: 'Masew', duration: 420, url: '/music/03.mp3', coverHue: 175, imageName: '03.jpg' },
  { id: '4', title: 'Sao cũng được', artist: 'Binz', duration: 380, url: '/music/04.mp3', coverHue: 200, imageName: '04.jpg' },
  { id: '5', title: 'Hôn lễ của em', artist: 'Hiền Hồ', duration: 300, url: '/music/05.mp3', coverHue: 40, imageName: '05.jpg' },
];
