#!/bin/bash  

# kill -9  $(lsof -t -i :1200)
# debugInfo=true
# nohup npm restart>nohup.log 2>&1 &

# 检查操作系统是否为CentOS 7  
if [ "$(cat /etc/os-release | grep -w ID | awk '{print $3}')" == "centos" ] && [ "$(cat /etc/os-release | grep -w VERSION_ID | awk '{print $3}')" == "7" ]; then  
    echo "Operating system is CentOS 7."  
    # 获取使用端口1200的进程ID  
    PID=$(netstat -tuln | grep 1200 | awk '{print $4}' | cut -d'/' -f1)  
    # 终止进程  
    if [ -n "$PID" ]; then  
        echo "Killing process with ID: $PID"  
        kill $PID  
    else  
        echo "No process found on port 1200."  
    fi  
else  
    PORT_1200=$(lsof -t -i :1200)  
    if [[ -n $PORT_1200 ]]; then  
        echo "Port 1200 is in use. Killing process $PORT_1200."  
        kill -9 $PORT_1200  
    else  
        echo "Port 1200 is not in use."  
    fi  
fi  
  
debugInfo=true  
