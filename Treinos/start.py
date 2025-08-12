from yt_dlp import YoutubeDL

playlist_url = "https://www.youtube.com/playlist?list=PLqfBMglaerTxLsfr2HlJXm68DEQFXnsgS"

ydl_opts = {
    'ignoreerrors': True,
    'quiet': True,
    'extract_flat': True,  # só pega info, não baixa
}

with YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(playlist_url, download=False)
    entries = info.get('entries', [])

    print(f"total de vídeos: {len(entries)}")
    print("\nvídeos e links:")
    for i, video in enumerate(entries, start=1):
        title = video.get('title')
        url = video.get('url')
        # monta o link completo do YouTube
        link = f"{url}"
        print(f"{i}. {title} - {link}")
