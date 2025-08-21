<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading com vídeo</title>

    <style>
        body,
        html {
            color: white;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #1f2122;
        }

        #intro-video {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            z-index: 9999;
        }

        #intro-video.fade-out {
            animation: fadeOut 3s forwards;
        }

        @keyframes fadeOut {
            to {
                opacity: 0;
                visibility: hidden;
            }
        }

        #site {
            display: none;
        }
    </style>
</head>

<body>
    <video id="intro-video" autoplay muted>
        <source src="../assets/images/load.mp4" type="video/mp4">
        Seu navegador não suporta vídeo.
    </video>

    <div id="site">
        <h1>gozei🎉</h1>
    </div>

    <script>
        const video = document.getElementById("intro-video");
        const site = document.getElementById("site");

        video.onloadedmetadata = () => {
            // tempo antes de terminar pra começar o fade (em segundos)
            const fadeBefore = 2;
            setTimeout(() => {
                video.classList.add("fade-out");
            }, (video.duration - fadeBefore) * 2500);
        };

        video.onended = () => {
            site.style.display = "block";
            document.body.style.overflow = "auto"; // libera scroll
        };
    </script>
</body>

</html>