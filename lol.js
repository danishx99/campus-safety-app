function doSomething(number){
    return new Promise((resolve, reject) => {
      if(number > 0){
        return resolve("positive");
      }else{
        return reject("negative");
      }
    });
}


async function hi(){

    try{
        let result = await doSomething(-1);
        console.log(result);
    }catch(err){
        console.log(err);
    }

}

hi();

console.log('Hi completed')