const wordsSet = new Set();   
  
const fs = require('fs');    
const readline = require('readline');    

module.exports = {  
    loadWords: function() {  
        if(wordsSet.size > 0) {  
          return;  
        }  

        // check file exist
        let wordsFile = '/home/caton.hao/softs/RSSHub/words.txt';
        try {  
          fs.accessSync(wordsFile, fs.constants.F_OK);  
        } catch (err) {  
          wordsFile = '/Users/ht/software/RSSHub/words.txt';  
        } 

        const fileStream = fs.createReadStream(wordsFile);
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
        inputString = inputString.toLowerCase();

        // 将输入字符串分割成一个Set    
        let inputWords = new Set(inputString.split(/['"1234567890.$\-\[\]()/%*\s,。？！；：“‘”‘（）《》【】——…—·…—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—·…·—]/));    
        
        // 计算两个Set之间的重合率
        // let overlap = new Set([...inputWords].filter(x => !wordsSet.has(x) ));
        let unknowWords = new Set([...inputWords].filter(x => {  
          let withoutSuffix = x.endsWith('ing')?x.slice(0, -3):x.endsWith('ly') ? x.slice(0, -2):x.endsWith('ed') ? x.slice(0, -2) : x.endsWith('es') ? x.slice(0, -2) : x.endsWith('s') ? x.slice(0, -1): x.endsWith('d') ? x.slice(0, -1) : x;  
          return !wordsSet.has(x) && !wordsSet.has(withoutSuffix);  
        }));
        
        // 如果任何一个Set为空，重合率为0    
        if (inputWords.size === 0) {    
            return [0, unknowWords];    
        } else {    
            // 计算重合率
            return [(1 - unknowWords.size / inputWords.size).toFixed(2), Array.from(unknowWords).join('<br/>')];    
        }    
      }
}

//==使用方法==
// const words = require('@/utils/words');
// words.loadWords();
// const [rate, unknowWords] = words.wordsRate(item.html());
// <hr>${unknowWords}
//==========  

