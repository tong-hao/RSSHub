kill -9  $(lsof -t -i :1200)
debugInfo=true
nohup npm restart>nohup.log 2>&1 &
