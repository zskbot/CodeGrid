#!/data/data/com.termux/files/usr/bin/bash

cd "$(dirname "$0")"

PORT=8899
PIDFILE=".codegrid.pid"
LOGFILE="codegrid.log"

echo "===== CODEGRID SERVER ====="

# Stop process cũ
if [ -f "$PIDFILE" ]; then
    OLD_PID="$(cat "$PIDFILE" 2>/dev/null || true)"

    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Stopping old PID=$OLD_PID"
        kill "$OLD_PID" 2>/dev/null || true
        sleep 1
        kill -9 "$OLD_PID" 2>/dev/null || true
    fi

    rm -f "$PIDFILE"
fi

# Dọn CodeGrid server cũ
pkill -f "node server/index.js" 2>/dev/null || true
sleep 1

rm -f "$LOGFILE"

echo "Starting CodeGrid on port $PORT"

PORT="$PORT" node server/index.js > "$LOGFILE" 2>&1 &
PID=$!

echo "$PID" > "$PIDFILE"

# Chờ Node khởi động
sleep 1

# Kiểm tra process
if kill -0 "$PID" 2>/dev/null; then

    echo "================================"
    echo "        CODEGRID ONLINE"
    echo "================================"
    echo "PID: $PID"
    echo "PORT: $PORT"
    echo "URL: http://127.0.0.1:$PORT"
    echo "================================"

else

    echo "================================"
    echo "       CODEGRID FAILED"
    echo "================================"

    cat "$LOGFILE"

    rm -f "$PIDFILE"

    exit 1

fi
