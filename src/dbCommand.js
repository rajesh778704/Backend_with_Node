db.cars.aggregate([
    {$match:{maker:"Hyundai","engine.cc":{$gt:1000}}}
])

db.cars.aggregate([
{$match:{maker:"Hyundai"}},
{
    $project:{
        "maker":1,
        "model":1,
        "fuel_type":1,
        "_id":0
    }
}

])

//aggregate string operator

db.cars.aggregate([
    {
        $project:{"_id":0,
            Cars :{$concat:["$maker"," ","$model"]}
        }
    }
])

//to uper and lower

db.cars.aggregate([
    {
        $project:{
            "_id":0,
            Model:{$toLower:"$model"}
        }
    }
])

// to Upper case

db.cars.aggregate([
    {
        $project:{
            "_id":0,
            Model:{$toUpper:"$model"}
        }
    }
])

//concart and lower

db.cars.aggregate([
    {
        $project:{
            "_id":0,
            Model:{$toUpper:{
                $concat:["$maker"," ","$model"]
            }}
        }
    }
])

db.cars.aggregate([
    {
        $project:{
            _id:0,
            model:1,
            isDiesel:{
                $regexMatch:{
                    input:"$fuel_type",
                    regex:"Die"
                }
            }
        }
    }
])

db.cars.aggregate([
    
])