# Thư mục nhạc nền (`public/music`)

Đặt file MP3 theo đúng tên để player tự phát (cùng origin, tương thích Web Audio API):

| File | Gợi ý |
|------|--------|
| `01.mp3` … `10.mp3` | Khớp với `src/data/musicPlaylist.ts` |

Bạn có thể thay bằng bài của bạn — giữ nguyên tên file hoặc sửa `url` trong `musicPlaylist.ts`.

## Tải demo nhanh (một bài, copy làm 10 slot)

```bash
cd public/music
curl -L -o 01.mp3 "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
for i in 02 03 04 05 06 07 08 09 10; do cp 01.mp3 "$i.mp3"; done
```

Lưu ý: mỗi file SoundHelix ~8MB; chỉ dùng demo, nên thay bằng file nhạc ngắn/bạn sở hữu bản quyền.

Hoặc chạy từ gốc repo: `./scripts/fetch-demo-music.sh`
