const wordsSet = new Set();   
  
const fs = require('fs');    
const readline = require('readline');    

module.exports = {  
    loadWords: function() {  
        if(wordsSet.size > 0) {  
          return;  
        }  
        
        const fileStream = fs.createReadStream('/Users/ht/software/RSSHub/words.txt');    
        const rl = readline.createInterface({    
            input: fileStream,    
            output: process.stdout,    
            terminal: false    
        });    
        
        rl.on('line', function(line) {      
          // 对每一行进行分割，并添加到hashSet中      
          line.split(' ').forEach(word => wordsSet.add(word));      
        });   
        
        rl.on('close', function() {  
          fileStream.close();  
        });  
    },

    wordsRate: function(inputString) {    
        // 将输入字符串分割成一个Set    
        let inputWords = new Set(inputString.split(/[\s,。？！；：“‘”‘（）《》【】——…—·…—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—]/));    
        
        // 计算两个Set之间的重合率    
        let overlapCount = new Set([...inputWords].filter(x => wordsSet.has(x))).size;    
        
        // 如果任何一个Set为空，重合率为0    
        if (inputWords.size === 0 || overlapCount === 0) {    
            return 0;    
        } else {    
            // 计算重合率    
            return overlapCount / inputWords.size;    
        }    
      }
}

  

