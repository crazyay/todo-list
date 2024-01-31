const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();
// let items=[];
// let worklist=[];

///mongodb work 
mongoose.connect(DBURL)
.then(result=>{
    console.log("connected to mongodb");
})
.catch(err=>{
    console.log(err);
})
const todoschema=mongoose.Schema({
    item:String
       
});


const todomodel=mongoose.model("item",todoschema);

const data1=new todomodel({
     item:"Hi enter your list"
})
///lsit schema
const listschema=mongoose.Schema({
    name:String,
    items:[todoschema]
});
//lsit model
const listmodel=mongoose.model("list",listschema);

let defaultitems=[data1];



// let items=[data1,data2,data3];

// todomodel.insertMany(items);


///database work ends here



app.use(bodyparser.urlencoded({extended:false}));  //body parser  to convert the incoming data 
app.set('view engine', 'ejs');                   // set the view as ejs wihtout this we cannnet use ejs
app.use(express.static("public"));            // to launch static files 
var global="";
app.get("/",function(req,res){
    var today= new Date();
    var day="";
    var findday=today.getDay();
//   switch(findday){

//     case 0: day="Sunday";
//             break;
//     case 1: day="Monday";
//             break;
//     case 2: day="Tuesday";
//             break; 
//     case 3: day="Wednesday";
//             break; 
//     case 4: day="Thursday";
//             break;  
//     case 5: day="Friday"
//             break;        
//     case 6: day="Saturday";
//             break;
//     default:
//         res.send("Enter a valid day");
     
//   }op

// const todomodel=mongoose.model("item",todoschema);

var options={                    //created a fromat in which we want date to recived from Date()function
    weekday:"long",
    day:"numeric",
    month:"long",
    };
day=today.toLocaleDateString("en-IN",options);

 todomodel.find().exec()          ///this will check if list is empty then only it will insert default items
 .then(result=>{
    if(result.length===0){
     todomodel.insertMany(defaultitems);
     res.redirect("/");
    }else{
    res.render("list",{listTitle:"Today",newitems:result,notstring:global});
    }
    //  console.log(result);
    //  console.log("data recived");
 })
 .catch(err=>{
     console.log(err);
 })
})

app.post("/",(req,res)=>{
   const items=req.body.list;
   const listname=req.body.button;
  
   if(items===null ||items.trim() === ''){
   
      global="enter a valid value";
     }
   else
   { 
    global="";
    const data=new todomodel({

         item:items
    });
    if(listname==="Today"){
      data.save();
      res.redirect("/") 
}else{
   listmodel.findOne({name:listname}).exec()
   .then(result=>{
    result.items.push(data);
    result.save();
    res.redirect("/"+listname);
   })
}
 }

})
//     if(item!=null &&item.trim() !== ''){
//      if(req.body.button==="work"){ 
//         worklist.push(item);
//         res.redirect("/work");
//     }else{
//         items.push(item);
//         res.redirect("/"); 
//     }  
// }
// else{
//     res.status(400).send("Enter a valid string");
//     res.redirect("/");
// }


app.post("/delete",function(req,res){ 
// console.log(req.body.checkbox);   
const remove=req.body.checkbox;
const listname=req.body.listname;
// todomodel.findByIdAndDelete(remove) 
if(listname==="Today"){
todomodel.deleteMany({_id:remove})
.then(result=>{
    console.log(result);
})
.catch(err=>{
    console.log(err);
});
res.redirect("/");
}
else{
 listmodel.findOneAndUpdate({name:listname},{$pull:{items:{_id:remove}}}).exec()
 .then(result=>{
    console.log(result);
 }).catch(err=>{
    console.log(err);
 })
 res.redirect("/"+listname);
}
})

// res.render("list",{listTitle:"work list",newitems:worklist});
// app.post("/work",function(req,res){
//     let item=req.body.list;
//     worklist.push(item);
//     res.redirect("/work");

// }) 
 
app.get("/:custompage",(req,res)=>{
    
    const add= _.capitalize(req.params.custompage);
    // const listpage=
    listmodel.findOne({name:add}).exec().then(resp=>{
        if(resp===null){
            const customdata=new listmodel({
                name:add,
                items:defaultitems
            });
            customdata.save();
            res.redirect("/"+ add);
        }else{
            res.render("list",{listTitle:resp.name,newitems:resp.items,notstring:global});
        }
    }).catch(err=>{
        console.log(err);
    })
  

})
app.get("/about",(req,res)=>{ 
    res.render("about"); 
 })

app.listen(4000,function(){
    console.log("server 4000 started");  
});