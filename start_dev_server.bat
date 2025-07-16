@echo off

:: Python 組み込みHTTPサーバーの起動
start cmd /k "python -m http.server 8000"

echo Python HTTPサーバーを起動中...

:: サーバーが起動するまで少し待つ（必要に応じて調整）
timeout /t 1 /nobreak >nul

:: ブラウザで開く
start "" "http://localhost:8000"

echo ブラウザで http://localhost:8000 を開きました。
echo サーバーのログは新しいコマンドプロンプトウィンドウで確認してください。