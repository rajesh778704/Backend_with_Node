const asyncHandeler= (resquestHandler)=>{
   (req,res,next)=>{
    Promise.resolve(
        resquestHandler(req,res,next)
    ).catch((err)=>next(err))
   }
}

export {asyncHandeler};