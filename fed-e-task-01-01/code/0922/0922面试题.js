new Promise((resolve,reject)=>{
    console.log("A");//1
    setTimeout(()=>{//栈1
        console.log("B");//栈1出 12 处理栈2
    },0);
    console.log("C");//2
    resolve();//微1
    console.log("D");//3
})
    .then(()=>{//微1出
        console.log("E");//6
        new Promise((resolve,reject)=>{
            console.log("F");//7
            resolve();//微3
            console.log("G");//8
        })
            .then(()=>{//微3出
                setTimeout(()=>{//栈3
                    console.log("H");//栈3出 15 处理栈4
                },0);
                console.log("I");//10  ！！！！
            })
            .then(()=>{
                console.log("J");//11 微任务处理完毕 处理栈1
            });
    })
    .then(()=>{
        console.log("K");//9   ！！！！ K和I 执行顺序错误 第二个then要重新排队放到下一轮微任务列表 所以在这里是排到微2后面
    });

new Promise((resolve,reject)=>{
    console.log("M");//4
    resolve();//微2
}).then(()=>{//微2出
    setTimeout(()=>{//栈2
        new Promise((resolve,reject)=>{//栈2出
            console.log("N");//13
            resolve();//微4 先处理微4再处理栈3
        })
            .then(()=>{//微4出
                setTimeout(()=>{//栈4
                    console.log("O");//栈4出 16 栈4处理完毕 运行结束
                },0);
            })
            .then(()=>{
                console.log("P");//14 微处理完毕 处理栈3
            });
    },0);
});

console.log("Q");//5 宏结束 处理微