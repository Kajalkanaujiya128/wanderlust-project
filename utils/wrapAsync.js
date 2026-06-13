module.exports=(fn)=>{
    return(Req,res,next)=>{
        fn(Req,res,next).catch(next);
    };
};