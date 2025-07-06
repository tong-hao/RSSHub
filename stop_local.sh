#!/bin/bash  
pids=$(ps -ef | grep RSSHub | grep -v "auto" | awk '{print $2}')  
# 逐个 kill RSSHub 进程
for pid in $pids; do
  kill -9 $pid
  echo "kill $pid"
done
 
